import React, { useState } from 'react';
import { useStaffDashboardData } from '../hooks/useStaffDashboardData';
import StaffStatsHeader from './staff/StaffStatsHeader';
import StaffActiveSessionsList from './staff/StaffActiveSessionsList';
import StaffTasksPanel from './staff/StaffTasksPanel';
import AdminToolsCard from './staff/AdminToolsCard';
import { ServiceMenuModal } from '../../../components/ServiceMenuModal';
import { bookingService } from '../../../services/bookingService';

interface AdminStaffDashboardProps {
  userFullName: string;
  userRole: string;
}

const AdminStaffDashboard: React.FC<AdminStaffDashboardProps> = ({ userFullName, userRole }) => {
  const {
    tasks,
    spaceAssets,
    addonServices,
    loading,
    activeSessions,
    overdueSessions,
    upcoming2h,
    pendingTasks,
    refreshData,
    toggleTaskStatus,
    createQuickTask,
  } = useStaffDashboardData();

  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [serviceBookingId, setServiceBookingId] = useState<number | undefined>(undefined);

  const handleOpenAddService = (bookingId: number) => {
    setServiceBookingId(bookingId);
    setIsServiceMenuOpen(true);
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
        <h2 className="text-3xl font-serif text-white">Bảng điều khiển Vận hành</h2>
        <p className="text-stone-400 text-sm mt-1">
          Xin chào, <strong className="text-white">{userFullName || 'Staff'}</strong>! Trung tâm theo dõi phiên làm việc thời gian thực và điều phối công việc ca trực.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <StaffStatsHeader
        activeCount={activeSessions.length}
        totalRooms={spaceAssets.length || 10}
        overdueCount={overdueSessions.length}
        firstOverdueCustomer={firstOverdueCustomer}
        upcomingCount={upcoming2h.length}
        pendingTaskCount={pendingTasks.length}
      />

      {/* Split View: Left Column (Active Sessions) & Right Column (Staff Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StaffActiveSessionsList
            activeSessions={activeSessions}
            spaceAssets={spaceAssets}
            onRefresh={refreshData}
            onOpenAddService={handleOpenAddService}
            onCheckout={handleCheckout}
          />
        </div>

        <div>
          <StaffTasksPanel
            tasks={tasks}
            onToggleTask={toggleTaskStatus}
            onCreateTask={createQuickTask}
          />
        </div>
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
    </div>
  );
};

export default AdminStaffDashboard;
