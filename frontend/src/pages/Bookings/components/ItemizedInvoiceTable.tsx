import React from 'react';
import type { Booking } from '../../../types/booking.types';

interface ItemizedInvoiceTableProps {
  invoiceDetail: any;
  booking: Booking;
  apiSpaceAsset?: any;
  dbSpaceAsset?: any;
  isRoomPaid: boolean;
  layoutName: string;
  fallbackHours: number;
  services: any[];
  formatToVNTime: (dateInput: string | Date | null | undefined) => string;
}

export const ItemizedInvoiceTable: React.FC<ItemizedInvoiceTableProps> = ({
  invoiceDetail,
  booking,
  apiSpaceAsset,
  dbSpaceAsset,
  isRoomPaid,
  layoutName,
  fallbackHours,
  services,
  formatToVNTime
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
        Hóa đơn thanh toán chi tiết
      </h4>
      {invoiceDetail ? (
        <div style={{
          backgroundColor: 'rgba(122, 134, 106, 0.04)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          lineHeight: '1.5'
        }}>
          <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--secondary-text)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 4px' }}>Tên khoản phí</th>
                  <th style={{ padding: '6px 4px' }}>Số lượng</th>
                  <th style={{ padding: '6px 4px' }}>Đơn giá</th>
                  <th style={{ padding: '6px 4px' }}>Loại</th>
                  <th style={{ padding: '6px 4px' }}>Thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: `Thuê không gian: ${apiSpaceAsset?.assetName ?? dbSpaceAsset?.assetName ?? dbSpaceAsset?.AssetName ?? `Phòng #${booking.assetId}`}`,
                    quantity: `${invoiceDetail.scheduledHours} giờ`,
                    price: invoiceDetail.basePricePerHour,
                    type: 'Đặt trước',
                    status: isRoomPaid ? 'Paid' : 'Unpaid'
                  },
                  invoiceDetail.layoutSetupFee > 0 ? {
                    name: `Phụ phí sơ đồ bày trí (${invoiceDetail.layoutName})`,
                    quantity: 1,
                    price: invoiceDetail.layoutSetupFee,
                    type: 'Đặt trước',
                    status: isRoomPaid ? 'Paid' : 'Unpaid'
                  } : null,
                  ...invoiceDetail.services.map((srv: any) => ({
                    name: srv.serviceName,
                    quantity: srv.quantity,
                    price: srv.unitPrice,
                    type: srv.isIncurred ? 'Phát sinh' : 'Đặt trước',
                    status: srv.paymentStatus
                  })),
                  invoiceDetail.overtimeSubtotal > 0 ? {
                    name: 'Phụ thu quá giờ (Overtime 1.5x)',
                    quantity: `${invoiceDetail.overtimeHours} giờ`,
                    price: invoiceDetail.overtimeRatePerHour,
                    type: 'Phát sinh',
                    status: invoiceDetail.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'
                  } : null
                ].filter(Boolean).map((row: any, rIdx: number) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '8px 4px', fontWeight: '600' }}>{row.name}</td>
                    <td style={{ padding: '8px 4px' }}>{row.quantity}</td>
                    <td style={{ padding: '8px 4px' }}>{row.price?.toLocaleString()}đ</td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        backgroundColor: row.type === 'Phát sinh' ? 'rgba(224, 122, 95, 0.1)' : 'rgba(122, 134, 106, 0.1)',
                        color: row.type === 'Phát sinh' ? '#e07a5f' : 'var(--nature-accent)'
                      }}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{
                        fontWeight: '600',
                        color: row.status === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
                      }}>
                        {row.status === 'Paid' ? 'Đã trả' : 'Chưa trả'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span>Tổng tiền hóa đơn:</span>
              <strong>{invoiceDetail.totalAmount?.toLocaleString()}đ</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', color: 'var(--nature-accent)' }}>
              <span>Đã thanh toán trước (Đặt cọc):</span>
              <span>-{invoiceDetail.paidUpfront?.toLocaleString()}đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(0,0,0,0.08)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 'bold' }}>Còn lại phải thu (Final Due):</span>
              <strong style={{ color: invoiceDetail.finalDue > 0 ? '#e07a5f' : 'var(--nature-accent)', fontSize: '1.05rem' }}>
                {invoiceDetail.finalDue?.toLocaleString()}đ
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem' }}>
              <span>Trạng thái thanh toán:</span>
              <span style={{
                fontWeight: 'bold',
                color: invoiceDetail.paymentStatus === 'Paid' ? 'var(--nature-accent)' : '#e07a5f',
                backgroundColor: invoiceDetail.paymentStatus === 'Paid' ? 'rgba(122, 134, 106, 0.08)' : 'rgba(224, 122, 95, 0.08)',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {invoiceDetail.paymentStatus === 'Paid' ? 'ĐÃ THANH TOÁN ĐỦ' : 'CẦN THANH TOÁN THÊM'}
              </span>
            </div>
            {invoiceDetail.issuedAt && (
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: '8px', textAlign: 'right' }}>
                Ngày xuất hóa đơn: {formatToVNTime(invoiceDetail.issuedAt)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'rgba(122, 134, 106, 0.04)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          lineHeight: '1.5'
        }}>
          <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--secondary-text)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 4px' }}>Tên khoản phí</th>
                  <th style={{ padding: '6px 4px' }}>Số lượng</th>
                  <th style={{ padding: '6px 4px' }}>Đơn giá</th>
                  <th style={{ padding: '6px 4px' }}>Loại</th>
                  <th style={{ padding: '6px 4px' }}>Thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: `Thuê không gian: ${apiSpaceAsset?.assetName ?? dbSpaceAsset?.assetName ?? dbSpaceAsset?.AssetName ?? `Phòng #${booking.assetId}`}`,
                    quantity: `${fallbackHours} giờ`,
                    price: booking.snapshotBasePrice,
                    type: 'Đặt trước',
                    status: isRoomPaid ? 'Paid' : 'Unpaid'
                  },
                  booking.snapshotPriceModifier > 0 ? {
                    name: `Phụ phí sơ đồ bày trí (${layoutName})`,
                    quantity: 1,
                    price: booking.snapshotPriceModifier,
                    type: 'Đặt trước',
                    status: isRoomPaid ? 'Paid' : 'Unpaid'
                  } : null,
                  ...(services || []).map((srv: any) => ({
                    name: srv.serviceName,
                    quantity: srv.quantity,
                    price: srv.snapshotUnitPrice,
                    type: srv.isIncurred ? 'Phát sinh' : 'Đặt trước',
                    status: srv.paymentStatus
                  }))
                ].filter(Boolean).map((row: any, rIdx: number) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '8px 4px', fontWeight: '600' }}>{row.name}</td>
                    <td style={{ padding: '8px 4px' }}>{row.quantity}</td>
                    <td style={{ padding: '8px 4px' }}>{row.price?.toLocaleString()}đ</td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        backgroundColor: row.type === 'Phát sinh' ? 'rgba(224, 122, 95, 0.1)' : 'rgba(122, 134, 106, 0.1)',
                        color: row.type === 'Phát sinh' ? '#e07a5f' : 'var(--nature-accent)'
                      }}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{
                        fontWeight: '600',
                        color: row.status === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
                      }}>
                        {row.status === 'Paid' ? 'Đã trả' : 'Chưa trả'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
