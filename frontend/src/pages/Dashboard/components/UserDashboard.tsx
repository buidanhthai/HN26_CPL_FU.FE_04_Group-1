import React, { useState } from 'react';
import { ServiceMenuModal } from '../../../components/ServiceMenuModal';
import { bookingService } from '../../../services/bookingService';
import { useActiveBooking } from '../hooks/useActiveBooking';
import ActiveSessionCard from './ActiveSessionCard';
import BillDetailsCard from './BillDetailsCard';
import OrderServicePanel from './OrderServicePanel';
import EmptyBookingState from './EmptyBookingState';

interface UserDashboardProps {
  userFullName: string;
  userRole: string;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const UserDashboard: React.FC<UserDashboardProps> = ({ userFullName, userRole }) => {
  const { activeBooking, setActiveBooking, addonServices, loadingActive, fetchActiveBooking } =
    useActiveBooking(userRole);

  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Welcome Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '15px',
        }}
      >
        <div>
          <h1 className="page-title">Xin chào, {userFullName}!</h1>
          <p className="page-desc" style={{ margin: 0 }}>
            Chào mừng bạn quay trở lại với Cozy Space. Chúc bạn một ngày làm việc hiệu quả và
            nhiều cảm hứng!
          </p>
        </div>
        <button
          onClick={fetchActiveBooking}
          className="btn btn-secondary hover-lift"
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
        >
          🔄 Tải lại dữ liệu
        </button>
      </div>

      {loadingActive ? (
        /* Loading State */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            backgroundColor: 'var(--surface-color)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            gap: '15px',
          }}
        >
          <div
            className="spinner"
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(111, 78, 55, 0.1)',
              borderTop: '4px solid var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--secondary-text)', fontWeight: '600' }}>
            Đang kết nối tới Cozy Space...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : activeBooking ? (
        /* Active Booking Layout */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left: session info + bill */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ActiveSessionCard
              activeBooking={activeBooking}
              formatCurrency={formatCurrency}
              onRefresh={fetchActiveBooking}
            />
            <BillDetailsCard activeBooking={activeBooking} formatCurrency={formatCurrency} />
          </div>

          {/* Right: order service panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <OrderServicePanel onOpenServiceMenu={() => setIsServiceMenuOpen(true)} />
          </div>
        </div>
      ) : (
        /* Empty State */
        <EmptyBookingState onOpenServiceMenu={() => setIsServiceMenuOpen(true)} />
      )}

      {/* Unified Service Menu Modal */}
      <ServiceMenuModal
        isOpen={isServiceMenuOpen}
        onClose={() => setIsServiceMenuOpen(false)}
        bookingId={activeBooking?.booking?.id}
        addonServices={addonServices}
        viewOnly={!activeBooking}
        onOrderSuccess={async () => {
          const updatedBooking = await bookingService.getActiveBooking();
          setActiveBooking(updatedBooking);
        }}
      />
    </div>
  );
};

export default UserDashboard;
