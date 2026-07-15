import React from 'react';
import type { Booking } from '../../../types/booking.types';

interface BookingHistoryTableProps {
  bookings: Booking[];
  spaceAssets: any[];
  user: any;
  onViewDetails: (id: number) => void;
  onPayment: (id: number) => void;
  onCheckout: (booking: Booking) => void;
  onRequestCheckin: (id: number) => Promise<void>;
  onCheckin: (id: number, code: string) => Promise<void>;
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
  onRequestCheckin,
  onCheckin,
  onDelete,
  loading
}) => {
  const [checkinCodes, setCheckinCodes] = React.useState<{[key: number]: string}>({});
  return (
    <div className="panel-card">
      <h2 className="panel-title">
        Danh sách đặt chỗ sắp tới
      </h2>

      {loading ? (
        <p className="page-desc">Đang tải danh sách đặt chỗ...</p>
      ) : bookings.length === 0 ? (
        <p className="page-desc" style={{ fontStyle: 'italic' }}>Bạn chưa có lịch đặt nào.</p>
      ) : (
        <div className="table-container">
          <table className="theme-table">
            <thead>
              <tr className="theme-tr-head">
                <th className="theme-th">Không gian</th>
                <th className="theme-th">Bắt đầu</th>
                <th className="theme-th">Kết thúc</th>
                <th className="theme-th">Trạng thái</th>
                <th className="theme-th" style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="theme-tr-body">
                  <td className="theme-td" style={{ fontWeight: '600', color: 'var(--primary-text)' }}>
                    {spaceAssets.find(a => a.id === b.assetId)?.assetName || `Phòng #${b.assetId}`}
                    {b.customerName && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'normal' }}>
                        Khách: {b.customerName}
                      </span>
                    )}
                  </td>
                  <td className="theme-td">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="theme-td">{new Date(b.endTime).toLocaleString()}</td>
                  <td className="theme-td">
                    <span className={`badge ${
                      b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Checked_In' || b.bookingStatus === 'Checked_Out' ? 'badge-completed' :
                      b.bookingStatus === 'Cancelled' ? 'badge-cancelled' : 'badge-inprogress'
                     }`}>
                      {b.bookingStatus === 'Confirmed' ? 'Đã xác nhận' :
                       b.bookingStatus === 'Cancelled' ? 'Đã hủy' :
                       b.bookingStatus === 'Awaiting_Payment' ? 'Chờ thanh toán' :
                       b.bookingStatus === 'Checked_In' ? 'Đã Check-in' :
                       b.bookingStatus === 'Awaiting_Checkout' ? 'Chờ Checkout' :
                       b.bookingStatus === 'Checked_Out' ? 'Đã Checkout' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="theme-td" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => onViewDetails(b.id)}
                        className="btn-link-primary"
                      >
                        Chi tiết
                      </button>
                      {b.bookingStatus === 'Awaiting_Payment' && (
                        <button
                          onClick={() => onPayment(b.id)}
                          className="btn btn-primary"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}
                        >
                          Thanh toán
                        </button>
                      )}
                      {b.bookingStatus === 'Confirmed' && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {user?.role === 'USER' ? (
                            !b.checkInVerificationCode ? (
                              <button
                                onClick={() => onRequestCheckin(b.id)}
                                className="btn btn-primary"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Yêu cầu Check-in
                              </button>
                            ) : (
                              <div style={{
                                padding: '6px 10px',
                                backgroundColor: 'rgba(9, 133, 242, 0.1)',
                                borderRadius: '6px',
                                border: '1px dashed #0985f2',
                                color: '#0985f2',
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                              }}>
                                Mã Check-in: {b.checkInVerificationCode}
                              </div>
                            )
                          ) : (
                            b.checkInVerificationCode ? (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  placeholder="Mã check-in..."
                                  value={checkinCodes[b.id] || ''}
                                  onChange={(e) => setCheckinCodes({ ...checkinCodes, [b.id]: e.target.value })}
                                  className="form-input"
                                  style={{
                                    padding: '4px 8px',
                                    width: '100px',
                                    fontSize: '0.8rem'
                                  }}
                                />
                                <button
                                  onClick={async () => {
                                    const enteredCode = checkinCodes[b.id] || '';
                                    if (!enteredCode.trim()) {
                                      alert('Vui lòng nhập mã check-in.');
                                      return;
                                    }
                                    await onCheckin(b.id, enteredCode);
                                    setCheckinCodes({ ...checkinCodes, [b.id]: '' });
                                  }}
                                  className="btn btn-primary"
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Xác nhận
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                                Chờ khách nhận mã
                              </span>
                            )
                          )}
                        </div>
                      )}
                      {b.bookingStatus === 'Awaiting_Checkout' && user?.role !== 'USER' && (
                        <button
                          onClick={() => onCheckout(b)}
                          className="btn btn-primary"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}
                        >
                          Checkout
                        </button>
                      )}
                      {b.bookingStatus === 'Cancelled' && (
                        <button 
                          onClick={() => onDelete(b.id)}
                          className="btn-link-danger"
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
