import React from 'react';

interface IncurredServicesTableProps {
  services: any[];
}

export const IncurredServicesTable: React.FC<IncurredServicesTableProps> = ({ services }) => {
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
      <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Dịch vụ phát sinh trong quá trình sử dụng</h4>
      {services.length === 0 ? (
        <p className="page-desc" style={{ margin: '0' }}>Không phát sinh dịch vụ.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--secondary-text)' }}>
                <th style={{ padding: '6px 4px' }}>Tên dịch vụ</th>
                <th style={{ padding: '6px 4px', textAlign: 'center' }}>Số lượng</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Đơn giá</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', color: 'var(--primary-text)' }}>
                  <td style={{ padding: '8px 4px', fontWeight: '600' }}>{s.serviceName}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{s.quantity}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{s.snapshotUnitPrice.toLocaleString()}đ</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>{(s.snapshotUnitPrice * s.quantity).toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
