import React, { useState, useEffect } from 'react';
import { ServiceMenuModal } from '../../../components/ServiceMenuModal';
import { BookingDetailModal } from '../../Bookings/components/BookingDetailModal';
import { bookingService } from '../../../services/bookingService';
import { useActiveBooking } from '../hooks/useActiveBooking';
import { BookingSelector } from './BookingSelector';
import { UpcomingBookingsList } from './UpcomingBookingsList';
import api from '../../../services/api';
import ActiveSessionCard from './ActiveSessionCard';
import BillDetailsCard from './BillDetailsCard';
import EmptyBookingState from './EmptyBookingState';

interface UserDashboardProps {
  userFullName: string;
  userRole: string;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const UserDashboard: React.FC<UserDashboardProps> = ({ userFullName, userRole }) => {
  const { 
    activeBooking, 
    setActiveBooking, 
    addonServices, 
    upcomingBookings, 
    allUserBookings,
    loadingActive, 
    fetchActiveBooking 
  } = useActiveBooking(userRole);

  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);
  const [serviceBookingId, setServiceBookingId] = useState<number | undefined>(undefined);
  const [selectedManageBookingId, setSelectedManageBookingId] = useState<number | undefined>(undefined);

  // Fetch space assets to query names & locations of rooms
  useEffect(() => {
    api.get<any[]>('/space-assets')
      .then((res) => {
        setSpaceAssets(res.data);
      })
      .catch((err) => {
        console.error('Error fetching space assets:', err);
      });
  }, []);

  // Tự động gán booking đầu tiên đang hiển thị làm booking được quản lý
  useEffect(() => {
    if (activeBooking && selectedManageBookingId === undefined) {
      setSelectedManageBookingId(activeBooking.booking.id);
    }
  }, [activeBooking]);

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
            Chào mừng bạn quay trở lại với Cozy Space. Chúc bạn một ngày làm việc hiệu quả và nhiều cảm hứng!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeBooking && (
            <button
              onClick={() => {
                setServiceBookingId(activeBooking.booking.id);
                setIsServiceMenuOpen(true);
              }}
              className="btn btn-primary hover-lift"
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                backgroundColor: 'var(--accent-color)',
                borderColor: 'var(--accent-color)',
                fontWeight: 'bold'
              }}
            >
              🍽️ Gọi thêm dịch vụ
            </button>
          )}
          <button
            onClick={() => fetchActiveBooking(selectedManageBookingId)}
            className="btn btn-secondary hover-lift"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>
      </div>

      {/* Dropdown quản lý Booking khi user có nhiều đơn */}
      <BookingSelector 
        allUserBookings={allUserBookings}
        selectedManageBookingId={selectedManageBookingId}
        onChange={(id) => {
          setSelectedManageBookingId(id);
          fetchActiveBooking(id);
        }}
        spaceAssets={spaceAssets}
      />

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
      ) : (
        <>
          {/* Upcoming Bookings Section */}
          <UpcomingBookingsList 
            upcomingBookings={upcomingBookings}
            spaceAssets={spaceAssets}
            onViewDetails={async (id) => {
              try {
                const details = await bookingService.getBookingDetails(id);
                setSelectedBookingDetails(details);
              } catch {
                alert('Lỗi tải chi tiết đặt chỗ.');
              }
            }}
            onOrderService={(id) => {
              setServiceBookingId(id);
              setIsServiceMenuOpen(true);
            }}
            onPaymentSuccess={() => {
              fetchActiveBooking(selectedManageBookingId);
            }}
          />

          {activeBooking ? (
            /* Active Booking Layout: 100% width, xếp dọc */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              <ActiveSessionCard
                activeBooking={activeBooking}
                formatCurrency={formatCurrency}
                onRefresh={() => fetchActiveBooking(selectedManageBookingId)}
              />
              <BillDetailsCard activeBooking={activeBooking} formatCurrency={formatCurrency} />
            </div>
          ) : (
            /* Empty State */
            <EmptyBookingState onOpenServiceMenu={() => {
              setServiceBookingId(undefined);
              setIsServiceMenuOpen(true);
            }} />
          )}
        </>
      )}

      {/* Unified Service Menu Modal */}
      <ServiceMenuModal
        isOpen={isServiceMenuOpen}
        onClose={() => setIsServiceMenuOpen(false)}
        bookingId={serviceBookingId}
        addonServices={addonServices}
        viewOnly={!serviceBookingId}
        onOrderSuccess={async () => {
          const updatedBooking = await bookingService.getActiveBooking(selectedManageBookingId);
          setActiveBooking(updatedBooking);
          fetchActiveBooking(selectedManageBookingId); // Reload upcoming bookings as well
        }}
      />

      {/* Details View Modal */}
      {selectedBookingDetails && (
        <BookingDetailModal 
          details={selectedBookingDetails}
          onClose={() => setSelectedBookingDetails(null)}
          spaceAssets={spaceAssets}
        />
      )}
    </div>
  );
};

export default UserDashboard;
