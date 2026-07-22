import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../../../services/bookingService';
import { taskService } from '../../../services/taskService';
import api from '../../../services/api';
import type { Booking } from '../../../types/booking.types';
import type { Task } from '../../../types/task.types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface ActiveSessionDetailed extends Booking {
  services?: Array<{
    serviceId: number;
    serviceName: string;
    quantity: number;
    snapshotUnitPrice: number;
    paymentStatus: 'Paid' | 'Unpaid';
    isIncurred: boolean;
  }>;
  customerFullName?: string;
  isOverdue?: boolean;
  overdueMinutes?: number;
  overtimeFee?: number;
}

export function useStaffDashboardData() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeSessionsDetailed, setActiveSessionsDetailed] = useState<ActiveSessionDetailed[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);
  const [addonServices, setAddonServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[StaffDashboard] Initiating API data fetch...');

      const [bookingsData, tasksData, assetsRes, servicesData] = await Promise.all([
        bookingService.getBookings().then((res) => {
          console.log('[StaffDashboard] /api/bookings success:', res.length, 'records');
          return res;
        }).catch((err) => {
          console.error('[StaffDashboard Error] /api/bookings failed:', err?.response?.data || err.message);
          return [];
        }),

        taskService.getTasks().then((res) => {
          console.log('[StaffDashboard] /api/tasks success:', res.length, 'records');
          return res;
        }).catch((err) => {
          console.error('[StaffDashboard Error] /api/tasks failed:', err?.response?.data || err.message);
          return [];
        }),

        api.get<any[]>('/space-assets').then((res) => {
          console.log('[StaffDashboard] /api/space-assets success:', res.data?.length, 'records');
          return res;
        }).catch((err) => {
          console.error('[StaffDashboard Error] /api/space-assets failed:', err?.response?.data || err.message);
          return { data: [] };
        }),

        bookingService.getAddOnServices().then((res) => {
          console.log('[StaffDashboard] /api/addon-services success:', res.length, 'records');
          return res;
        }).catch((err) => {
          console.error('[StaffDashboard Error] /api/addon-services failed:', err?.response?.data || err.message);
          return [];
        })
      ]);

      setBookings(bookingsData);
      setTasks(tasksData);
      setSpaceAssets(assetsRes.data || []);
      setAddonServices(servicesData);

      // Filter active sessions and fetch detailed services + backend overdue calculations
      const activeList = bookingsData.filter((b) => {
        const status = (b.bookingStatus || '').toString().toLowerCase();
        return status === 'checked_in' || status === 'awaiting_checkout' || status === 'checkedin';
      });

      console.log('[StaffDashboard] Filtered Active Sessions count:', activeList.length, 'out of total bookings:', bookingsData.length);

      const detailedList: ActiveSessionDetailed[] = await Promise.all(
        activeList.map(async (b) => {
          try {
            const details = await bookingService.getBookingDetails(b.id);
            return {
              ...b,
              services: details.services || [],
              customerFullName: details.user?.fullName || b.customerName || `Khách hàng #${b.userId}`,
              isOverdue: details.isOverdue ?? (b.bookingStatus === 'Checked_In' && dayjs().tz('Asia/Ho_Chi_Minh').isAfter(dayjs(b.endTime).tz('Asia/Ho_Chi_Minh'))),
              overdueMinutes: details.overdueMinutes ?? 0,
              overtimeFee: details.overtimeFee ?? 0
            };
          } catch (err: any) {
            console.error(`[StaffDashboard Error] Booking Details #${b.id} failed:`, err?.message);
            return { ...b, services: [] };
          }
        })
      );

      setActiveSessionsDetailed(detailedList);
    } catch (err) {
      console.error('[StaffDashboard Error] Unhandled error during fetch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const nowTz = dayjs().tz('Asia/Ho_Chi_Minh');

  const overdueSessions = activeSessionsDetailed.filter((b) => b.isOverdue);

  const upcoming2h = bookings.filter((b) => {
    if (b.bookingStatus !== 'Confirmed') return false;
    const startTimeTz = dayjs(b.startTime).tz('Asia/Ho_Chi_Minh');
    const diffHours = startTimeTz.diff(nowTz, 'hour', true);
    return diffHours >= 0 && diffHours <= 2;
  });

  const pendingTasks = tasks.filter((t) => t.taskStatus !== 'Completed');

  const toggleTaskStatus = async (task: Task) => {
    try {
      const nextStatus = task.taskStatus === 'Completed' ? 'In_Progress' : 'Completed';
      await taskService.updateTask(task.id, { taskStatus: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, taskStatus: nextStatus } : t))
      );
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const createQuickTask = async (description: string) => {
    try {
      const newTask = await taskService.createTask({
        bookingId: activeSessionsDetailed[0]?.id || 1,
        taskCategory: 'LOGISTICS',
        taskDescription: description,
        requiredStaffCount: 1
      });
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  return {
    bookings,
    activeSessions: activeSessionsDetailed,
    tasks,
    spaceAssets,
    addonServices,
    loading,
    overdueSessions,
    upcoming2h,
    pendingTasks,
    refreshData: fetchData,
    toggleTaskStatus,
    createQuickTask
  };
}
