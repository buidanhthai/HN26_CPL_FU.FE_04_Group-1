import React from 'react';
import type { Booking } from '../../types/booking.types';

interface BookingDetailModalProps {
  details: {
    booking: Booking;
    user?: { fullName: string; email: string };
    services: any[];
    logs: any[];
    invoices: any[];
  } | null;
  onClose: () => void;
  spaceAssets: any[];
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  details,
  onClose,
  spaceAssets
}) => {
  if (!details) return null;

  const { booking, user, services, logs, invoices } = details;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '650px' }}>
        <h3 className="modal-title">
          CHI TIẾT ĐƠN ĐẶT PHÒNG #{booking.id}
        </h3>

        {/* Room details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Phòng đặt:</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
              {spaceAssets.find(a => a.id === booking.assetId)?.assetName || `Phòng #${booking.assetId}`}
            </p>
          </div>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Trạng thái:</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--nature-accent)' }}>
              {booking.bookingStatus === 'Awaiting_Payment' ? 'Chờ thanh toán' :
               booking.bookingStatus === 'Confirmed' ? 'Đã xác nhận' :
               booking.bookingStatus === 'Checked_In' ? 'Đã Check-in' :
               booking.bookingStatus === 'Checked_Out' ? 'Đã Checkout' :
               booking.bookingStatus === 'Cancelled' ? 'Đã hủy do chưa thanh toán đặt trước' : booking.bookingStatus}
            </p>
          </div>
          {booking.checkInVerificationCode && (
            <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(212, 163, 115, 0.12)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--accent-color)', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Mã xác nhận Check-in:</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-text)', letterSpacing: '2px', fontFamily: 'monospace' }}>
                {booking.checkInVerificationCode}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                * Xuất trình mã này cho nhân viên lễ tân khi bạn đến Cozy Space để nhận phòng.
              </span>
            </div>
          )}
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Thời gian bắt đầu:</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              {new Date(booking.startTime).toLocaleString()}
            </p>
          </div>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Thời gian kết thúc:</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              {new Date(booking.endTime).toLocaleString()}
            </p>
          </div>
          {booking.customerName && (
            <div>
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Tên khách (Đại diện):</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
                {booking.customerName}
              </p>
            </div>
          )}
          {booking.customerPhone && (
            <div>
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>SĐT khách:</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
                {booking.customerPhone}
              </p>
            </div>
          )}
          {booking.createdByUserId && (
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Nhân viên tạo yêu cầu:</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                Staff ID #{booking.createdByUserId}
              </p>
            </div>
          )}
        </div>

        {/* Customer information (non-USER only) */}
        {user && (
          <div style={{
            backgroundColor: 'rgba(212, 163, 115, 0.08)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              Thông tin khách hàng đặt
            </h4>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontWeight: '600' }}>Họ tên:</span> {user.fullName}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Email:</span> {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Services booked state */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            Trạng thái dịch vụ đang hoặc đã được đặt
          </h4>
          {services.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0' }}>Không sử dụng dịch vụ.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--secondary-text)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 4px' }}>Tên dịch vụ</th>
                    <th style={{ padding: '6px 4px' }}>Số lượng</th>
                    <th style={{ padding: '6px 4px' }}>Đơn giá</th>
                    <th style={{ padding: '6px 4px' }}>Loại</th>
                    <th style={{ padding: '6px 4px' }}>Thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '8px 4px', fontWeight: '600' }}>{s.serviceName}</td>
                      <td style={{ padding: '8px 4px' }}>{s.quantity}</td>
                      <td style={{ padding: '8px 4px' }}>{s.snapshotUnitPrice.toLocaleString()}đ</td>
                      <td style={{ padding: '8px 4px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          backgroundColor: s.isIncurred ? 'rgba(224, 122, 95, 0.1)' : 'rgba(122, 134, 106, 0.1)',
                          color: s.isIncurred ? '#e07a5f' : 'var(--nature-accent)'
                        }}>
                          {s.isIncurred ? 'Phát sinh' : 'Đặt trước'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 4px' }}>
                        <span style={{
                          fontWeight: '600',
                          color: s.paymentStatus === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
                        }}>
                          {s.paymentStatus === 'Paid' ? 'Đã trả' : 'Chưa trả'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invoices List */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            Hóa đơn thanh toán
          </h4>
          {invoices.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0', fontStyle: 'italic' }}>Chưa xuất hóa đơn nào.</p>
          ) : (
            invoices.map((inv: any, idx: number) => (
              <div key={idx} style={{
                backgroundColor: 'rgba(122, 134, 106, 0.04)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>Loại hóa đơn:</span> {inv.invoiceType === 'Upfront' ? 'Trả trước' : 'Hóa đơn cuối'}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>Ngày xuất:</span> {new Date(inv.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <div>
                    Tổng tiền: <strong>{inv.totalAmount.toLocaleString()}đ</strong>
                  </div>
                  <div>
                    Đã trả trước: <span style={{ color: 'var(--nature-accent)' }}>{inv.paidUpfront.toLocaleString()}đ</span>
                  </div>
                  <div>
                    Phải thu thêm: <span style={{ color: '#e07a5f', fontWeight: 'bold' }}>{inv.finalDue.toLocaleString()}đ</span>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Trạng thái thanh toán:</span>
                  <span style={{
                    fontWeight: 'bold',
                    color: inv.paymentStatus === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
                  }}>
                    {inv.paymentStatus === 'Paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Audit Logs */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            Lịch sử thao tác trên hệ thống
          </h4>
          {logs.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0', fontStyle: 'italic' }}>Chưa có thao tác nào ghi lại.</p>
          ) : (
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              {logs.map((log: any, idx: number) => (
                <div key={idx} style={{
                  padding: '8px 12px',
                  borderBottom: idx < logs.length - 1 ? '1px solid var(--border-color)' : 'none',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{log.userFullName}</span>: {log.actionDescription}
                  </div>
                  <div style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '8px 24px', borderRadius: '6px', fontSize: '0.9rem' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
