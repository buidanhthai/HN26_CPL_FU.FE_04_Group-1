import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../../types/booking.types';

interface BookingDataTableProps {
  bookings: Booking[];
  spaceAssets: any[];
  user: any;
  onViewDetails: (id: number) => void;
  onPayment: (id: number) => void;
  onCheckout: (booking: Booking) => void;
  onCheckin: (id: number) => void;
  onDelete: (id: number) => void;
  selectedBookingId?: number;
  onSelectBooking: (id: number) => void;
}

export const BookingDataTable: React.FC<BookingDataTableProps> = ({
  bookings,
  spaceAssets,
  user,
  onViewDetails,
  onPayment,
  onCheckout,
  onCheckin,
  onDelete,
  selectedBookingId,
  onSelectBooking,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Checked_In':
        return <span className="badge" style={{ backgroundColor: 'rgba(79, 163, 209, 0.15)', color: '#4fa3d1', fontWeight: 'bold' }}>Đang hoạt động</span>;
      case 'Confirmed':
        return <span className="badge" style={{ backgroundColor: 'rgba(212, 163, 115, 0.15)', color: 'var(--accent-color)', fontWeight: 'bold' }}>Đã xác nhận</span>;
      case 'Awaiting_Payment':
        return <span className="badge" style={{ backgroundColor: 'rgba(255, 183, 3, 0.15)', color: '#ffb703', fontWeight: 'bold' }}>Chờ thanh toán</span>;
      case 'Checked_Out':
        return <span className="badge" style={{ backgroundColor: 'rgba(107, 191, 126, 0.15)', color: '#6bbf7e', fontWeight: 'bold' }}>Đã hoàn thành</span>;
      case 'Cancelled':
        return <span className="badge" style={{ backgroundColor: 'rgba(224, 122, 95, 0.15)', color: '#e07a5f', fontWeight: 'bold' }}>Đã hủy</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getRoomName = (assetId: number) => {
    const asset = spaceAssets.find(a => a.id === assetId || a.Id === assetId);
    return asset?.assetName || `Phòng #${assetId}`;
  };

  return (
    <div className="table-container" style={{ backgroundColor: 'var(--surface-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--secondary-text)' }}>
          🔍 Không tìm thấy đơn đặt phòng nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <table className="theme-table" style={{ width: '100%', fontSize: '0.85rem' }}>
          <thead>
            <tr className="theme-tr-head">
              <th className="theme-th" style={{ padding: '12px 10px' }}>Trạng thái</th>
              <th className="theme-th" style={{ padding: '12px 10px' }}>Không gian</th>
              <th className="theme-th" style={{ padding: '12px 10px' }}>Mã Đơn</th>
              <th className="theme-th" style={{ padding: '12px 10px' }}>Thời gian sử dụng</th>
              <th className="theme-th" style={{ padding: '12px 10px' }}>Ghi chú đặc biệt</th>
              <th className="theme-th" style={{ padding: '12px 10px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const isSelected = selectedBookingId === b.id;
              const formattedStart = new Date(b.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
              const formattedEnd = new Date(b.endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

              return (
                <tr
                  key={b.id}
                  onClick={() => onSelectBooking(b.id)}
                  className="theme-tr-body"
                  style={{
                    backgroundColor: isSelected ? 'rgba(212, 163, 115, 0.12)' : undefined,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <td className="theme-td" style={{ padding: '12px 10px' }}>{getStatusBadge(b.bookingStatus)}</td>
                  <td className="theme-td" style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--primary-text)' }}>
                    {getRoomName(b.assetId)}
                  </td>
                  <td className="theme-td" style={{ padding: '12px 10px', color: 'var(--accent-hover)', fontWeight: 'bold' }}>{b.bookingCode}</td>
                  <td className="theme-td" style={{ padding: '12px 10px' }}>
                    <div>{formattedStart}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>đến {formattedEnd}</div>
                  </td>
                  <td className="theme-td" style={{ padding: '12px 10px', color: 'var(--secondary-text)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.customSetupNote || '-'}
                  </td>
                  <td className="theme-td" style={{ padding: '12px 10px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button onClick={() => onViewDetails(b.id)} className="btn-link-primary" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                        Chi tiết
                      </button>

                      {b.bookingStatus === 'Checked_In' && (
                        <button
                          onClick={() => navigate('/service-requests')}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'rgba(79, 163, 209, 0.1)', color: '#4fa3d1', border: '1px solid #4fa3d1' }}
                        >
                          Báo sự cố nhanh
                        </button>
                      )}

                      {b.bookingStatus === 'Awaiting_Payment' && (
                        <button onClick={() => onPayment(b.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none' }}>
                          Thanh toán
                        </button>
                      )}

                      {b.bookingStatus === 'Confirmed' && user?.role !== 'USER' && (
                        <button onClick={() => onCheckin(b.id)} className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#6bbf7e', color: 'white', border: 'none' }}>
                          Check-in
                        </button>
                      )}

                      {(b.bookingStatus === 'Checked_In' || b.bookingStatus === 'Awaiting_Checkout') && user?.role !== 'USER' && (
                        <button onClick={() => onCheckout(b)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none' }}>
                          Trả phòng
                        </button>
                      )}

                      {b.bookingStatus === 'Cancelled' && (
                        <button onClick={() => onDelete(b.id)} className="btn-link-danger" style={{ fontSize: '0.8rem', color: '#e07a5f', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default BookingDataTable;
