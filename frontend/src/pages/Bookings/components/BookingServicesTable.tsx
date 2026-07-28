import React from 'react';

interface BookingServicesTableProps {
  services: any[];
}

export const BookingServicesTable: React.FC<BookingServicesTableProps> = ({ services }) => {
  return (
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
  );
};
