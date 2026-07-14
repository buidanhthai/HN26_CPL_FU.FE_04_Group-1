import React from 'react';
import Button from '../Button';

interface BookingFormProps {
  user: any;
  spaceAssets: any[];
  assetId: number;
  setAssetId: (val: number) => void;
  layoutId: number;
  setLayoutId: (val: number) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  startTimeStr: string;
  setStartTimeStr: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  endTimeStr: string;
  setEndTimeStr: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenMapModal: () => void;
  error: string;
  success: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  user,
  spaceAssets,
  assetId,
  setAssetId,
  layoutId,
  setLayoutId,
  startDate,
  setStartDate,
  startTimeStr,
  setStartTimeStr,
  endDate,
  setEndDate,
  endTimeStr,
  setEndTimeStr,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  onSubmit,
  onOpenMapModal,
  error,
  success
}) => {
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <div style={{
      backgroundColor: 'var(--surface-color)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '30px 24px',
      boxShadow: 'var(--shadow)'
    }}>
      <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Thêm lịch đặt mới
      </h2>

      {error && (
        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(224, 122, 95, 0.12)', color: '#e07a5f', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(122, 134, 106, 0.12)', color: 'var(--nature-accent)', fontSize: '0.85rem', marginBottom: '15px' }}>{success}</div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {isStaffOrAdmin && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Tên khách hàng</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="Nhập tên khách hàng"
                className="input-field" 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Số điện thoại</label>
              <input 
                type="text" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                placeholder="Nhập SĐT khách hàng"
                className="input-field" 
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Không gian</label>
            <button
              type="button"
              onClick={onOpenMapModal}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--accent-color)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              🗺️ Chọn qua sơ đồ
            </button>
          </div>
          <select 
            value={assetId} 
            onChange={(e) => setAssetId(Number(e.target.value))}
            className="input-field"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          >
            {spaceAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.assetName} ({asset.locationName}) - {asset.basePrice.toLocaleString()}đ/h
              </option>
            ))}
          </select>
        </div>

        {assetId === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Bố trí bàn ghế (Layout)</label>
            <select 
              value={layoutId} 
              onChange={(e) => setLayoutId(Number(e.target.value))}
              className="input-field"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              <option value={1}>Chữ U (+50,000đ - 15p setup)</option>
              <option value={2}>Lớp học (+0đ - 20p setup)</option>
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Ngày bắt đầu</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Giờ</label>
            <input type="time" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} className="input-field" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Ngày kết thúc</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Giờ</label>
            <input type="time" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)} className="input-field" />
          </div>
        </div>

        <Button type="submit" style={{ marginTop: '10px' }}>Đặt chỗ ngay</Button>
      </form>
    </div>
  );
};
