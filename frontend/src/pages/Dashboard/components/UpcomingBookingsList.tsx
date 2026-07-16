import React from 'react';
import type { Booking } from '../../../types/booking.types';
import { bookingService } from '../../../services/bookingService';

interface UpcomingBookingsListProps {
  upcomingBookings: Booking[];
  spaceAssets: any[];
  onViewDetails: (id: number) => void;
  onOrderService: (id: number) => void;
  onPaymentSuccess: () => void;
}

export const UpcomingBookingsList: React.FC<UpcomingBookingsListProps> = ({
  upcomingBookings,
  spaceAssets,
  onViewDetails,
  onOrderService,
  onPaymentSuccess
}) => {
  if (upcomingBookings.length === 0) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontFamily: 'var(--font-title)', 
        color: 'var(--primary-text)', 
        marginBottom: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        📅 Đặt chỗ sắp tới ({upcomingBookings.length})
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {upcomingBookings.map((b) => {
          const asset = spaceAssets.find(a => a.id === b.assetId || a.Id === b.assetId);
          const isAwaitingPay = b.bookingStatus === 'Awaiting_Payment';
          return (
            <div 
              key={b.id}
              style={{
                backgroundColor: 'var(--surface-color)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`badge ${isAwaitingPay ? 'badge-unassigned' : 'badge-completed'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {isAwaitingPay ? 'Chờ thanh toán' : 'Đã xác nhận'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontWeight: 'bold' }}>#{b.id}</span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary-text)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  🏢 {asset?.assetName || `Không gian #${b.assetId}`}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                  📍 {asset?.locationName || 'N/A'}
                </p>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--primary-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>🕒 {new Date(b.startTime).toLocaleDateString()}</div>
                  <div>⏰ {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button 
                  onClick={() => onViewDetails(b.id)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  Chi tiết
                </button>
                
                <button 
                  onClick={() => onOrderService(b.id)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  🍽️ Dịch vụ
                </button>

                {isAwaitingPay && (
                  <button 
                    onClick={async () => {
                      try {
                        await bookingService.confirmPayment(b.id);
                        alert('Thanh toán thành công!');
                        onPaymentSuccess();
                      } catch (e: any) {
                        alert(e.response?.data?.message || 'Lỗi thanh toán');
                      }
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                  >
                    Thanh toán
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
