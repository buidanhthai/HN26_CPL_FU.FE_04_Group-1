import React, { useState, useContext } from 'react';
import dayjs from 'dayjs';
import { useStaffDashboardData } from '../hooks/useStaffDashboardData';
import StaffStatsHeader from './staff/StaffStatsHeader';
import StaffActiveSessionsList from './staff/StaffActiveSessionsList';
import StaffTasksPanel from './staff/StaffTasksPanel';
import AdminToolsCard from './staff/AdminToolsCard';
import { ServiceMenuModal } from '../../../components/ServiceMenuModal';
import { bookingService } from '../../../services/bookingService';
import { ExtendBookingModal } from './staff/ExtendBookingModal';
import { SwitchRoomModal } from './staff/SwitchRoomModal';
import { StaffServiceRequestsPanel } from './staff/StaffServiceRequestsPanel';
import { AuthContext } from '../../../context/AuthContext';
import { BookingTimeline } from '../../Bookings/components/BookingTimeline';

interface AdminStaffDashboardProps {
  userFullName: string;
  userRole: string;
}

const getPriorityWeight = (p: string) => {
  const upper = (p || '').toUpperCase();
  if (upper.includes('URGENT')) return 4;
  if (upper.includes('HIGH')) return 3;
  if (upper.includes('MED')) return 2;
  if (upper.includes('LOW')) return 1;
  return 0;
};

const AdminStaffDashboard: React.FC<AdminStaffDashboardProps> = ({ userFullName, userRole }) => {
  const { user } = useContext(AuthContext) || {};
  const {
    tasks,
    spaceAssets,
    addonServices,
    loading,
    bookings,
    activeSessions,
    overdueSessions,
    upcoming2h,
    pendingTasks,
    serviceRequests,
    refreshData,
    toggleTaskStatus,
    updateRequestStatus,
    createQuickTask,
    claimTask,
  } = useStaffDashboardData();

  // Active Filter state corresponding to the 4 header cards:
  // 'ACTIVE' | 'OVERDUE' | 'UPCOMING' | 'TASKS'
  const [activeFilter, setActiveFilter] = useState<'ACTIVE' | 'OVERDUE' | 'UPCOMING' | 'TASKS'>('ACTIVE');
  const [timelineDate, setTimelineDate] = useState(dayjs().format('YYYY-MM-DD'));

  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [serviceBookingId, setServiceBookingId] = useState<number | undefined>(undefined);

  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [extendBookingId, setExtendBookingId] = useState<number | null>(null);

  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const [switchBookingId, setSwitchBookingId] = useState<number | null>(null);
  const [switchCurrentAssetId, setSwitchCurrentAssetId] = useState<number | null>(null);

  const handleOpenAddService = (bookingId: number) => {
    setServiceBookingId(bookingId);
    setIsServiceMenuOpen(true);
  };

  const handleOpenExtend = (bookingId: number) => {
    setExtendBookingId(bookingId);
    setIsExtendOpen(true);
  };

  const handleOpenSwitch = (bookingId: number, currentAssetId: number) => {
    setSwitchBookingId(bookingId);
    setSwitchCurrentAssetId(currentAssetId);
    setIsSwitchOpen(true);
  };

  const handleCheckout = async (bookingId: number) => {
    if (!window.confirm(`Xác nhận Checkout cho đơn #${bookingId}?`)) return;
    try {
      await bookingService.checkoutBooking(bookingId);
      alert('Checkout thành công. Đã tự động tạo Task dọn dẹp phòng.');
      refreshData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi Checkout.');
    }
  };

  const handleSelectTimelineBooking = (bk: any) => {
    alert(
      `Đơn đặt phòng #${bk.id}\n` +
      `Khách hàng: ${bk.customerName || `Khách hàng #${bk.userId}`}\n` +
      `Thời gian: ${dayjs(bk.startTime).format('HH:mm')} - ${dayjs(bk.endTime).format('HH:mm')}\n` +
      `Trạng thái: ${bk.bookingStatus}`
    );
  };

  if (loading && activeSessions.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 text-stone-400">
        <i className="fa-solid fa-spinner animate-spin text-2xl mr-3"></i>
        <span>Đang tải dữ liệu vận hành CozySpace...</span>
      </div>
    );
  }

  const firstOverdueCustomer = overdueSessions[0]?.customerName;

  return (
    <div className="space-y-8 pb-10">
      {/* Title & Welcome Section */}
      <div>
        <h2 className="text-3xl font-serif text-[var(--primary-text)]">Bảng điều khiển Vận hành</h2>
        <p className="text-[var(--secondary-text)] text-sm mt-1">
          Xin chào, <strong className="text-[var(--primary-text)]">{userFullName || 'Staff'}</strong>! Trung tâm theo dõi phiên làm việc thời gian thực và điều phối công việc ca trực.
        </p>
      </div>

      {/* 4 Stat Cards as Interactive Filters */}
      <StaffStatsHeader
        activeCount={activeSessions.length}
        totalRooms={spaceAssets.length || 10}
        overdueCount={overdueSessions.length}
        firstOverdueCustomer={firstOverdueCustomer}
        upcomingCount={upcoming2h.length}
        pendingTaskCount={pendingTasks.length}
        activeFilter={activeFilter}
        onChangeFilter={setActiveFilter}
      />

      {/* Split View: Left Column (Filtered content & Requests) & Right Column (Staff Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Conditional rendering based on the selected Stats Card filter */}
          {activeFilter === 'ACTIVE' && (
            <StaffActiveSessionsList
              activeSessions={activeSessions}
              spaceAssets={spaceAssets}
              onRefresh={refreshData}
              onOpenAddService={handleOpenAddService}
              onCheckout={handleCheckout}
              onOpenExtend={handleOpenExtend}
              onOpenSwitch={handleOpenSwitch}
            />
          )}

          {activeFilter === 'OVERDUE' && (
            <StaffActiveSessionsList
              activeSessions={overdueSessions}
              spaceAssets={spaceAssets}
              onRefresh={refreshData}
              onOpenAddService={handleOpenAddService}
              onCheckout={handleCheckout}
              onOpenExtend={handleOpenExtend}
              onOpenSwitch={handleOpenSwitch}
            />
          )}

          {activeFilter === 'UPCOMING' && (
            <div className="space-y-6">
              <h3 className="text-xl font-serif text-[var(--primary-text)] flex items-center gap-2 m-0">
                <span>📅 Đơn Sắp Check-in (2h tới)</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold">
                  {upcoming2h.length} đơn
                </span>
              </h3>
              {upcoming2h.length === 0 ? (
                <div className="bg-[var(--surface-color)] p-6 rounded-xl border border-[var(--border-color)] text-center text-[var(--secondary-text)] shadow-md">
                  Không có đơn đặt chỗ nào sắp check-in trong 2 giờ tới.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming2h.map((bk) => (
                    <div 
                      key={bk.id} 
                      className="bg-[var(--surface-color)] p-5 rounded-xl border border-[var(--border-color)] flex justify-between items-center shadow-md hover:border-amber-400 transition-all duration-200"
                    >
                      <div>
                        <h4 className="text-lg font-bold text-[var(--primary-text)] m-0">
                          Khách hàng: {bk.customerName || `Khách #${bk.userId}`} (Booking #{bk.id})
                        </h4>
                        <p className="text-[var(--secondary-text)] text-sm mt-1 mb-0 font-medium">
                          Vị trí: <strong className="text-[var(--primary-text)]">{spaceAssets.find(a => a.id === bk.assetId)?.assetName || `Không gian #${bk.assetId}`}</strong> &bull; {dayjs(bk.startTime).format('HH:mm')} - {dayjs(bk.endTime).format('HH:mm')} (Hôm nay)
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await bookingService.checkinBooking(bk.id, true);
                            alert('Check-in thành công!');
                            refreshData();
                          } catch (err: any) {
                            alert(err?.response?.data?.message || 'Lỗi khi check-in');
                          }
                        }}
                        className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition shadow-md cursor-pointer"
                      >
                        🚀 Nhận Phòng (Check-in)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeFilter === 'TASKS' && (
            <div className="space-y-6">
              <h3 className="text-xl font-serif text-[var(--primary-text)] flex items-center gap-2 m-0">
                <span>🧹 Nhiệm Vụ Dọn Dẹp & Setup Cần Làm</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold">
                  {tasks.filter(t => t.taskStatus !== 'Completed' && (t.taskCategory === 'LOGISTICS' || t.taskCategory === 'CLEANING')).length} nhiệm vụ
                </span>
              </h3>
              <div className="bg-[var(--surface-color)] rounded-xl p-5 border border-[var(--border-color)] space-y-4 shadow-md">
                {tasks.filter(t => t.taskStatus !== 'Completed' && (t.taskCategory === 'LOGISTICS' || t.taskCategory === 'CLEANING')).length === 0 ? (
                  <p className="text-sm text-[var(--secondary-text)] italic py-4 text-center m-0">🎉 Tất cả nhiệm vụ dọn dẹp và setup đã hoàn tất!</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.filter(t => t.taskStatus !== 'Completed' && (t.taskCategory === 'LOGISTICS' || t.taskCategory === 'CLEANING'))
                      .sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority))
                      .map((task) => {
                        const isUnassigned = task.taskStatus === 'Unassigned';
                        const isAssignedToMe = task.assignedStaff?.id === user?.id;
                        return (
                          <div key={task.id} className="p-4 bg-[var(--background-color)] rounded-lg border border-[var(--border-color)] flex justify-between items-center shadow-sm hover:border-amber-400 transition-all duration-200">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-color)] text-[var(--secondary-text)] border border-[var(--border-color)] font-bold">
                                  {task.taskCategory}
                                </span>
                                <span className={`badge text-[10px] priority-${task.priority.toLowerCase()} font-bold px-1.5 py-0.5 rounded border`}>
                                  {task.priority}
                                </span>
                                {task.assignedStaff && (
                                  <span className="text-[10px] text-amber-650 font-semibold">
                                    👤 {isAssignedToMe ? 'Bạn nhận' : task.assignedStaff.fullName}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-[var(--primary-text)] mt-2 mb-0">{task.taskDescription}</p>
                              <p className="text-xs text-[var(--secondary-text)] mt-1 mb-0">Booking #{task.bookingId} &bull; Deadline: {task.deadline ? dayjs(task.deadline).format('HH:mm') : 'N/A'}</p>
                            </div>
                            <div>
                              {isUnassigned ? (
                                <button
                                  onClick={() => claimTask(task.id)}
                                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition shadow cursor-pointer"
                                >
                                  Nhận việc
                                </button>
                              ) : isAssignedToMe ? (
                                <button
                                  onClick={() => toggleTaskStatus(task)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition shadow cursor-pointer"
                                >
                                  Hoàn thành
                                </button>
                              ) : (
                                <span className="text-xs text-[var(--secondary-text)] font-semibold">Đang xử lý</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Incidents & Support requests always visible at bottom of left column */}
          <StaffServiceRequestsPanel
            requests={serviceRequests}
            onUpdateRequestStatus={updateRequestStatus}
          />
        </div>

        {/* Right column: Shift operational tasks summary widget */}
        <div>
          <StaffTasksPanel
            tasks={tasks}
            userId={user?.id}
            onClaimTask={claimTask}
            onToggleTask={toggleTaskStatus}
            onCreateTask={createQuickTask}
          />
        </div>
      </div>

      {/* Sơ đồ Timeline hoạt động (Reusing schedule timeline at the bottom) */}
      <div className="w-full">
        <BookingTimeline
          bookings={bookings}
          spaceAssets={spaceAssets}
          timelineDate={timelineDate}
          setTimelineDate={setTimelineDate}
          onSelectBooking={handleSelectTimelineBooking}
        />
      </div>

      {/* Admin Panel for Admin Role */}
      <AdminToolsCard userRole={userRole} />

      {/* Service Menu Modal */}
      <ServiceMenuModal
        isOpen={isServiceMenuOpen}
        onClose={() => setIsServiceMenuOpen(false)}
        bookingId={serviceBookingId}
        addonServices={addonServices}
        onOrderSuccess={refreshData}
      />

      {/* Extend Booking Modal */}
      <ExtendBookingModal
        isOpen={isExtendOpen}
        onClose={() => {
          setIsExtendOpen(false);
          setExtendBookingId(null);
        }}
        bookingId={extendBookingId}
        onSuccess={refreshData}
      />

      {/* Switch Room Modal */}
      <SwitchRoomModal
        isOpen={isSwitchOpen}
        onClose={() => {
          setIsSwitchOpen(false);
          setSwitchBookingId(null);
          setSwitchCurrentAssetId(null);
        }}
        bookingId={switchBookingId}
        currentAssetId={switchCurrentAssetId}
        spaceAssets={spaceAssets}
        onSuccess={refreshData}
      />
    </div>
  );
};

export default AdminStaffDashboard;
