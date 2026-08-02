import React from 'react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: any;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  bookingDetails
}) => {
  if (!isOpen || !bookingDetails) return null;

  const { booking, spaceAsset, roomLayout, services = [] } = bookingDetails;
  
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const roomCost = (booking.snapshotBasePrice || 0) + (booking.snapshotPriceModifier || 0);
  const servicesCost = services.reduce((sum: number, svc: any) => sum + (svc.snapshotUnitPrice * svc.quantity), 0);
  const totalAmount = roomCost + servicesCost;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '95vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--secondary-text)'
          }}
        >
          ×
        </button>

        <h3 style={{ margin: '0 0 10px 0', fontFamily: 'var(--font-title)', fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          📄 Chi tiết Hóa đơn & Sử dụng
        </h3>

        <div style={{ fontSize: '0.85rem', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div><strong>Mã Booking:</strong> {booking.bookingCode}</div>
          <div><strong>Trạng thái đơn:</strong> Đã hoàn thành</div>
          <div><strong>Phòng họp:</strong> {spaceAsset?.assetName || `Phòng #${booking.assetId}`}</div>
          <div><strong>Sơ đồ:</strong> {roomLayout?.layoutName || 'Chữ U'}</div>
          <div><strong>Bắt đầu:</strong> {new Date(booking.startTime).toLocaleString('vi-VN')}</div>
          <div><strong>Kết thúc:</strong> {new Date(booking.endTime).toLocaleString('vi-VN')}</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontWeight: 'bold' }}>
              <th style={{ padding: '8px 0' }}>Khoản mục</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>SL</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Đơn giá</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '8px 0' }}>Tiền thuê phòng: {spaceAsset?.assetName}</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>1</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(booking.snapshotBasePrice)}</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(booking.snapshotBasePrice)}</td>
            </tr>
            {booking.snapshotPriceModifier > 0 && (
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0' }}>Phí setup sơ đồ: {roomLayout?.layoutName}</td>
                <td style={{ padding: '8px 0', textAlign: 'center' }}>1</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(booking.snapshotPriceModifier)}</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(booking.snapshotPriceModifier)}</td>
              </tr>
            )}
            {services.map((svc: any) => (
              <tr key={svc.id || svc.serviceId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0' }}>☕ {svc.serviceName || `Dịch vụ #${svc.serviceId}`}</td>
                <td style={{ padding: '8px 0', textAlign: 'center' }}>{svc.quantity}</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(svc.snapshotUnitPrice)}</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(svc.snapshotUnitPrice * svc.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ backgroundColor: 'rgba(111,78,55,0.05)', padding: '16px', borderRadius: '8px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Phí phòng (Bao gồm setup):</span>
            <strong>{formatCurrency(roomCost)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Dịch vụ ăn uống phát sinh:</span>
            <strong>{formatCurrency(servicesCost)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px', fontSize: '1rem', fontWeight: 'bold' }}>
            <span>Tổng cộng (Đã thanh toán):</span>
            <span style={{ color: 'var(--nature-accent)' }}>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--accent-color)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
