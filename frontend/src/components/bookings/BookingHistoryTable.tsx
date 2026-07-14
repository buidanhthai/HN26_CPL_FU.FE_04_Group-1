import React from 'react';
import type { Booking } from '../../types/booking.types';

interface BookingHistoryTableProps {
  bookings: Booking[];
  spaceAssets: any[];
  user: any;
  onViewDetails: (id: number) => void;
  onPayment: (id: number) => void;
  onCheckout: (booking: Booking) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

export const BookingHistoryTable: React.FC<BookingHistoryTableProps> = ({
  bookings,
  spaceAssets,
  user,
  onViewDetails,
  onPayment,
  onCheckout,
  onDelete,
  loading
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--surface-color)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '30px 24px',
      boxShadow: 'var(--shadow)'
    }}>
      <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Danh sách đặt chỗ sắp tới
      </h2>

      {loading ? (
        <p style={{ color: 'var(--secondary-text)' }}>Đang tải danh sách đặt chỗ...</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: 'var(--secondary-text)', fontStyle: 'italic' }}>Bạn chưa có lịch đặt nào.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--primary-text)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--secondary-text)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 8px' }}>Không gian</th>
                <th style={{ padding: '12px 8px' }}>Bắt đầu</th>
                <th style={{ padding: '12px 8px' }}>Kết thúc</th>
                <th style={{ padding: '12px 8px' }}>Trạng thái</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '14px 8px', fontWeight: '600', color: 'var(--primary-text)' }}>
                    {spaceAssets.find(a => a.id === b.assetId)?.assetName || `Phòng #${b.assetId}`}
                    {b.customerName && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'normal' }}>
                        Khách: {b.customerName}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 8px' }}>{new Date(b.startTime).toLocaleString()}</td>
                  <td style={{ padding: '14px 8px' }}>{new Date(b.endTime).toLocaleString()}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: 
                        b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Checked_In' || b.bookingStatus === 'Checked_Out' ? 'rgba(122, 134, 106, 0.15)' :
                        b.bookingStatus === 'Cancelled' ? 'rgba(224, 122, 95, 0.15)' : 'rgba(212, 163, 115, 0.15)',
                      color: 
                        b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Checked_In' || b.bookingStatus === 'Checked_Out' ? 'var(--nature-accent)' :
                        b.bookingStatus === 'Cancelled' ? '#e07a5f' : 'var(--accent-color)',
                    }}>
                      {b.bookingStatus === 'Confirmed' ? 'Đã xác nhận' :
                       b.bookingStatus === 'Cancelled' ? 'Đã hủy' :
                       b.bookingStatus === 'Awaiting_Payment' ? 'Chờ thanh toán' :
                       b.bookingStatus === 'Checked_In' ? 'Đã Check-in' :
                       b.bookingStatus === 'Checked_Out' ? 'Đã Checkout' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => onViewDetails(b.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--accent-color)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          textDecoration: 'underline'
                        }}
                      >
                        Chi tiết
                      </button>
                      {b.bookingStatus === 'Awaiting_Payment' && (
                        <button
                          onClick={() => onPayment(b.id)}
                          style={{
                            backgroundColor: 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Thanh toán
                        </button>
                      )}
                      {b.bookingStatus === 'Checked_In' && user?.role !== 'USER' && (
                        <button
                          onClick={() => onCheckout(b)}
                          style={{
                            backgroundColor: 'var(--nature-accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Checkout
                        </button>
                      )}
                      {b.bookingStatus === 'Cancelled' && (
                        <button 
                          onClick={() => onDelete(b.id)}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#e07a5f',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            transition: 'var(--transition)'
                          }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
