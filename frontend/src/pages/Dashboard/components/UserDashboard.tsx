import React, { useState, useEffect } from 'react';
import { useActiveBooking } from '../hooks/useActiveBooking';
import { bookingService } from '../../../services/bookingService';
import api from '../../../services/api';
import ActiveSessionCard from './ActiveSessionCard';
import BillDetailsCard from './BillDetailsCard';
import DashboardStats from './DashboardStats';
import { UpcomingBookingsList } from './UpcomingBookingsList';
import { PastBookingItem } from './PastBookingItem';
import { BookingDetailModal } from '../../Bookings/components/BookingDetailModal';
import { ServiceMenuModal } from '../../../components/ServiceMenuModal';

interface UserDashboardProps {
  userFullName: string;
  userRole: string;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const UserDashboard: React.FC<UserDashboardProps> = ({ userFullName, userRole }) => {
  const { 
    activeBooking, 
    addonServices,
    allUserBookings,
    pastBookings,
    upcomingBookings,
    loadingActive, 
    fetchActiveBooking,
    refreshData
  } = useActiveBooking(userRole);

  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ACTIVE');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [serviceBookingId, setServiceBookingId] = useState<number | undefined>(undefined);

  useEffect(() => {
    api.get<any[]>('/space-assets')
      .then(res => setSpaceAssets(res.data))
      .catch(err => console.error('Error fetching assets:', err));
  }, []);



  const activeCount = allUserBookings.filter(b => b.bookingStatus === 'Checked_In').length;
  const upcomingCount = upcomingBookings.length;
  const pastCount = pastBookings.length;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Xin chào, {userFullName}!</h1>
        <p className="page-desc" style={{ margin: 0 }}>
          Chào mừng bạn quay trở lại với Cozy Space. Quản lý các đơn đặt chỗ và dịch vụ của bạn tại đây.
        </p>
      </div>

      <DashboardStats
        activeCount={activeCount}
        upcomingCount={upcomingCount}
        pastCount={pastCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {loadingActive ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {activeTab === 'ACTIVE' && (
            activeBooking ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Selector for multiple active bookings */}
                {(() => {
                  const activeBookingsList = allUserBookings.filter(b => b.bookingStatus === 'Checked_In');
                  if (activeBookingsList.length <= 1) return null;
                  return (
                    <div style={{
                      backgroundColor: 'var(--surface-color)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: 'var(--shadow)',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-text)' }}>
                        👉 Chọn phòng đang hoạt động cần xem chi tiết:
                      </span>
                      <select
                        value={activeBooking.booking.id}
                        onChange={(e) => fetchActiveBooking(Number(e.target.value))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--background-color)',
                          color: 'var(--primary-text)',
                          fontWeight: '600',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {activeBookingsList.map((b) => {
                          const asset = spaceAssets.find(a => a.id === b.assetId || a.Id === b.assetId);
                          return (
                            <option key={b.id} value={b.id}>
                              Đơn #{b.id} - {asset?.assetName || `Phòng #${b.assetId}`} ({b.bookingCode})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>🛎️ Phiên làm việc đang hoạt động</h3>

                  <button
                    onClick={() => {
                      setServiceBookingId(activeBooking.booking.id);
                      setIsServiceMenuOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: 'var(--accent-color)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    🍽️ Gọi thêm dịch vụ
                  </button>
                </div>
                <ActiveSessionCard
                  activeBooking={activeBooking}
                  formatCurrency={formatCurrency}
                  onRefresh={() => fetchActiveBooking(activeBooking.booking.id)}
                />
                <BillDetailsCard activeBooking={activeBooking} formatCurrency={formatCurrency} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🛎️</span>
                <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-title)' }}>Không có phiên làm việc nào đang hoạt động</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Bạn hiện không ngồi trong phòng họp nào. Chọn tab "Sắp tới" để chuẩn bị check-in.</p>
              </div>
            )
          )}

          {activeTab === 'UPCOMING' && (
            <UpcomingBookingsList 
              upcomingBookings={upcomingBookings}
              spaceAssets={spaceAssets}
              onViewDetails={async (id) => {
                const details = await bookingService.getBookingDetails(id);
                setSelectedBookingDetails(details);
              }}
              onOrderService={(id) => {
                setServiceBookingId(id);
                setIsServiceMenuOpen(true);
              }}
              onPaymentSuccess={() => refreshData()}
            />
          )}

          {activeTab === 'COMPLETED' && (
            pastBookings.length > 0 ? (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', marginBottom: '16px' }}>✅ Lịch sử sử dụng phòng ({pastBookings.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {pastBookings.map((b) => (
                    <PastBookingItem
                      key={b.id}
                      booking={b}
                      spaceAsset={spaceAssets.find(a => a.id === b.assetId || a.Id === b.assetId)}
                      onReviewSubmitted={() => refreshData()}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>✅</span>
                <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-title)' }}>Chưa có phòng họp nào hoàn thành</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Khi bạn trả phòng, lịch sử sử dụng và hóa đơn sẽ xuất hiện tại đây.</p>
              </div>
            )
          )}
        </div>
      )}

      {selectedBookingDetails && (
        <BookingDetailModal 
          details={selectedBookingDetails}
          onClose={() => setSelectedBookingDetails(null)}
          spaceAssets={spaceAssets}
        />
      )}

      <ServiceMenuModal
        isOpen={isServiceMenuOpen}
        onClose={() => setIsServiceMenuOpen(false)}
        bookingId={serviceBookingId}
        addonServices={addonServices}
        viewOnly={!serviceBookingId}
        onOrderSuccess={async () => {
          refreshData();
        }}
      />
    </div>
  );
};

export default UserDashboard;
