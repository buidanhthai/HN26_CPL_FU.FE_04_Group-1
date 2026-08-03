import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import api from '../../services/api';
import { ReviewCard } from './components/ReviewCard';
import { InvoiceModal } from './components/InvoiceModal';

const HistoryReviews: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isAdminOrStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invoice modal state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsData, assetsData] = await Promise.all([
        bookingService.getBookings(),
        api.get<any[]>('/space-assets')
      ]);
      
      // Filter Checked_Out (Past/Completed) bookings
      const completed = bookingsData.filter(b => b.bookingStatus === 'Checked_Out');
      setPastBookings(completed);
      setSpaceAssets(assetsData.data);
    } catch (err) {
      console.error('Error fetching history data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewInvoice = async (bookingId: number) => {
    setLoadingInvoice(true);
    try {
      const details = await bookingService.getBookingDetails(bookingId);
      setSelectedBookingDetails(details);
      setIsInvoiceOpen(true);
    } catch (err) {
      console.error('Error loading booking details:', err);
      alert('Không thể tải chi tiết hóa đơn.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Lịch sử & Đánh giá</h1>
        <button 
          onClick={fetchData} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          🔄 Làm mới
        </button>
      </div>
      <p className="page-desc">
        Xem lịch sử sử dụng không gian và các phản hồi, đánh giá chất lượng dịch vụ của bạn tại Cozy Space.
      </p>

      {pastBookings.length === 0 ? (
        <div className="panel-card" style={{ backgroundColor: 'var(--surface-color)', padding: '50px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>⭐</span>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>Chưa có lịch sử sử dụng phòng</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 24px auto', fontSize: '0.9rem', color: 'var(--secondary-text)' }}>
            Bạn chưa hoàn thành đơn đặt phòng nào trước đây. Khi bạn check-out phòng thành công, lịch sử sử dụng sẽ xuất hiện tại đây để bạn có thể xem hóa đơn và gửi đánh giá.
          </p>
          <a href="/bookings" className="btn btn-primary" style={{ display: 'inline-block', padding: '10px 20px', fontWeight: 'bold', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: '8px' }}>
            Đặt phòng làm việc ngay
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {pastBookings.map((b) => {
            const asset = spaceAssets.find((a) => a.id === b.assetId || a.Id === b.assetId);
            return (
              <ReviewCard
                key={b.id}
                booking={b}
                spaceAsset={asset}
                isAdminOrStaff={isAdminOrStaff}
                onViewInvoice={handleViewInvoice}
              />
            );
          })}
        </div>
      )}

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setSelectedBookingDetails(null);
        }}
        bookingDetails={selectedBookingDetails}
      />

      {loadingInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      )}
    </div>
  );
};

export default HistoryReviews;
