import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking, CheckInEligibility } from '../../../types/booking.types';
import { bookingService } from '../../../services/bookingService';

interface BookingHistoryTableProps {
  bookings: Booking[];
  spaceAssets: any[];
  user: any;
  onViewDetails: (id: number) => void;
  onPayment: (id: number) => void;
  onCheckout: (booking: Booking) => void;
  onCheckin: (id: number, forceByAdmin?: boolean) => Promise<void>;
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
  onCheckin,
  onDelete,
  loading
}) => {
  const navigate = useNavigate();
  const [eligibilityMap, setEligibilityMap] = useState<Record<number, CheckInEligibility>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchEligibility = async () => {
      const confirmedBookings = bookings.filter(b => b.bookingStatus === 'Confirmed');
      const tempMap: Record<number, CheckInEligibility> = {};
      for (const b of confirmedBookings) {
        try {
          const eligibility = await bookingService.getCheckInEligibility(b.id);
          tempMap[b.id] = eligibility;
        } catch (err) {
          console.error("Lỗi khi tải độ khả thi checkin", err);
        }
      }
      setEligibilityMap(tempMap);
    };
    if (bookings.length > 0) {
      fetchEligibility();
    }
  }, [bookings, refreshTrigger]);

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
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--secondary-text)', fontWeight: 'normal' }}>
                      Mã đơn: {b.bookingCode}
                    </span>
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
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {user?.role === 'USER' ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                              Đã xác nhận đặt chỗ
                            </span>
                          ) : (
                            (() => {
                              const eligibility = eligibilityMap[b.id];
                              const canCheckIn = eligibility ? eligibility.canCheckIn : false;
                              const reasonCode = eligibility ? eligibility.reasonCode : 'LOADING';
                              const tooltipMsg = eligibility ? eligibility.userFriendlyMessage : 'Đang kiểm tra điều kiện check-in...';
                              const isTooEarly = reasonCode === 'TOO_EARLY';
                              const isTaskBlocked = reasonCode === 'TASK_NOT_COMPLETED';

                              return (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <button
                                    onClick={() => onCheckin(b.id)}
                                    disabled={!canCheckIn}
                                    title={tooltipMsg}
                                    className={`btn ${canCheckIn ? 'btn-success' : 'btn-secondary'}`}
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '4px',
                                      fontSize: '0.8rem',
                                      cursor: canCheckIn ? 'pointer' : 'not-allowed',
                                      opacity: canCheckIn ? 1 : 0.6,
                                      backgroundColor: canCheckIn ? '#28a745' : undefined,
                                      borderColor: canCheckIn ? '#28a745' : undefined,
                                      color: '#fff'
                                    }}
                                  >
                                    Check-in
                                  </button>

                                  {isTaskBlocked && eligibility?.actionTaskHintId && (
                                    <button
                                      onClick={() => navigate(`/tasks?id=${eligibility.actionTaskHintId}`)}
                                      className="btn"
                                      title={`Task Hậu cần #${eligibility.actionTaskHintId} chưa xong. Nhấn để đi tới trang dọn dẹp.`}
                                      style={{
                                        padding: '5px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        backgroundColor: '#ffc107',
                                        borderColor: '#ffc107',
                                        color: '#212529',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      🧹 Mở Task dọn phòng
                                    </button>
                                  )}

                                  {isTooEarly && user?.role === 'ADMIN' && (
                                    <button
                                      onClick={async () => {
                                        if (window.confirm("Bạn có chắc chắn muốn duyệt đặc cách CHECK-IN SỚM cho đơn này?")) {
                                          await onCheckin(b.id, true);
                                          setRefreshTrigger(prev => prev + 1);
                                        }
                                      }}
                                      className="btn"
                                      title="Duyệt Check-in sớm đặc cách (Chỉ dành cho Admin)"
                                      style={{
                                        padding: '5px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        backgroundColor: '#17a2b8',
                                        borderColor: '#17a2b8',
                                        color: '#fff',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      ⚡ Duyệt sớm (Admin)
                                    </button>
                                  )}
                                </div>
                              );
                            })()
                          )}
                        </div>
                      )}
                      {(b.bookingStatus === 'Checked_In' || b.bookingStatus === 'Awaiting_Checkout') && user?.role !== 'USER' && (
                        <button
                          onClick={() => onCheckout(b)}
                          className="btn btn-primary"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}
                        >
                          Thanh toán & Trả phòng
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
