import React from 'react';
import type { ActiveBookingResponse } from '../../../types/booking.types';

interface BillDetailsCardProps {
  activeBooking: ActiveBookingResponse;
  formatCurrency: (val: number) => string;
}

const BillDetailsCard: React.FC<BillDetailsCardProps> = ({ activeBooking, formatCurrency }) => {
  return (
    <div className="panel-card" style={{ padding: '24px' }}>
      <h3
        style={{
          margin: '0 0 15px 0',
          fontSize: '1.2rem',
          color: 'var(--primary-text)',
          fontFamily: 'var(--font-title)',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px',
        }}
      >
        💵 Chi tiết hóa đơn &amp; Dịch vụ hiện tại
      </h3>

      {/* Services Table */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <table className="theme-table" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr className="theme-tr-head">
              <th className="theme-th" style={{ padding: '8px' }}>Tên dịch vụ</th>
              <th className="theme-th" style={{ padding: '8px', textAlign: 'center' }}>Số lượng</th>
              <th className="theme-th" style={{ padding: '8px', textAlign: 'right' }}>Đơn giá</th>
              <th className="theme-th" style={{ padding: '8px', textAlign: 'right' }}>Thành tiền</th>
              <th className="theme-th" style={{ padding: '8px', textAlign: 'center' }}>Loại</th>
              <th className="theme-th" style={{ padding: '8px', textAlign: 'center' }}>Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {/* Space rent row */}
            <tr className="theme-tr-body" style={{ color: 'var(--primary-text)' }}>
              <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                Tiền thuê phòng: {activeBooking.spaceAsset.assetName}
              </td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>1</td>
              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                {formatCurrency(activeBooking.booking.snapshotBasePrice)}
              </td>
              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>
                {formatCurrency(activeBooking.booking.snapshotBasePrice)}
              </td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                <span
                  style={{
                    color: 'var(--secondary-text)',
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(111, 78, 55, 0.08)',
                    borderRadius: '4px',
                  }}
                >
                  Đặt trước
                </span>
              </td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                <span style={{ color: 'var(--nature-accent)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  ✓ Đã trả
                </span>
              </td>
            </tr>

            {/* Layout modifier row (only if modifier > 0) */}
            {activeBooking.booking.snapshotPriceModifier > 0 && (
              <tr
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--primary-text)',
                }}
              >
                <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                  Phí thiết lập layout: {activeBooking.roomLayout.layoutName}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>1</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                  {formatCurrency(activeBooking.booking.snapshotPriceModifier)}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>
                  {formatCurrency(activeBooking.booking.snapshotPriceModifier)}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <span
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      backgroundColor: 'rgba(111, 78, 55, 0.08)',
                      borderRadius: '4px',
                    }}
                  >
                    Đặt trước
                  </span>
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <span
                    style={{
                      color: 'var(--nature-accent)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    ✓ Đã trả
                  </span>
                </td>
              </tr>
            )}

            {/* Addon service rows */}
            {activeBooking.services.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '15px',
                    textAlign: 'center',
                    color: 'var(--secondary-text)',
                    fontStyle: 'italic',
                  }}
                >
                  Chưa gọi thêm dịch vụ nào trong phiên làm việc.
                </td>
              </tr>
            ) : (
              activeBooking.services.map((svc: any) => (
                <tr
                  key={svc.serviceId}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--primary-text)',
                  }}
                >
                  <td style={{ padding: '10px 8px', fontWeight: '500' }}>☕ {svc.serviceName}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold' }}>
                    {svc.quantity}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    {formatCurrency(svc.snapshotUnitPrice)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(svc.snapshotUnitPrice * svc.quantity)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span
                      style={{
                        color: svc.isIncurred ? 'var(--accent-hover)' : 'var(--secondary-text)',
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                        backgroundColor: svc.isIncurred
                          ? 'rgba(212, 163, 115, 0.15)'
                          : 'rgba(111, 78, 55, 0.08)',
                        borderRadius: '4px',
                        fontWeight: svc.isIncurred ? '500' : 'normal',
                      }}
                    >
                      {svc.isIncurred ? 'Phát sinh' : 'Đặt trước'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {svc.paymentStatus === 'Paid' ? (
                      <span
                        style={{
                          color: 'var(--nature-accent)',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        ✓ Đã trả
                      </span>
                    ) : (
                      <span style={{ color: '#D9534F', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        ✗ Chưa trả (Checkout)
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Billing Summary */}
      <div
        style={{
          backgroundColor: 'rgba(111, 78, 55, 0.04)',
          padding: '16px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--secondary-text)' }}>Phí thuê phòng (Đặt trước):</span>
          <span style={{ fontWeight: '500' }}>{formatCurrency(activeBooking.prepaidFee)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--secondary-text)' }}>Dịch vụ phát sinh (Chưa trả):</span>
          <span style={{ fontWeight: 'bold', color: '#D9534F' }}>
            {formatCurrency(activeBooking.incurredUnpaidTotal)}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '8px',
            fontSize: '1.05rem',
            fontWeight: 'bold',
            color: 'var(--primary-text)',
          }}
        >
          <span>Tổng giá trị hóa đơn (Tạm tính):</span>
          <span>{formatCurrency(activeBooking.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default BillDetailsCard;
