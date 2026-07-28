import React from 'react';

interface CheckoutPaymentSummaryProps {
  invoice: any;
}

export const CheckoutPaymentSummary: React.FC<CheckoutPaymentSummaryProps> = ({ invoice }) => {
  const formatCurrency = (val: number) => `${val.toLocaleString()}đ`;

  return (
    <div style={{ backgroundColor: 'rgba(122, 134, 106, 0.08)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
        <span>Tổng chi phí:</span>
        <span style={{ fontWeight: '600' }}>{formatCurrency(invoice.totalAmount)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
        <span>Đã cọc/trả trước:</span>
        <span>-{formatCurrency(invoice.paidUpfront)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginBottom: '8px' }}>
        <span>Phải thu thêm:</span>
        <span style={{ color: '#e07a5f' }}>{formatCurrency(invoice.finalDue)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
        <span>Trạng thái hóa đơn:</span>
        <span className={`badge ${invoice.paymentStatus === 'Paid' ? 'badge-completed' : 'badge-unassigned'}`}>
          {invoice.paymentStatus === 'Paid' ? 'Đã Thanh Toán Xong' : 'Chưa Thanh Toán'}
        </span>
      </div>
    </div>
  );
};
