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
    <div className="panel-card">
      <h2 className="panel-title">
        Thêm lịch đặt mới
      </h2>

      {error && (
        <div className="badge-unassigned" style={{ display: 'block', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</div>
      )}
      {success && (
        <div className="badge-completed" style={{ display: 'block', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px' }}>{success}</div>
      )}

      <form onSubmit={onSubmit} className="form-container">
        
        {isStaffOrAdmin && (
          <>
            <div className="form-group">
              <label className="form-label">Tên khách hàng</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="Nhập tên khách hàng"
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input 
                type="text" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                placeholder="Nhập SĐT khách hàng"
                className="form-input" 
              />
            </div>
          </>
        )}

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Không gian</label>
            <button
              type="button"
              onClick={onOpenMapModal}
              className="btn-link-primary"
            >
              🗺️ Chọn qua sơ đồ
            </button>
          </div>
          <select 
            value={assetId} 
            onChange={(e) => setAssetId(Number(e.target.value))}
            className="form-select"
          >
            {spaceAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.assetName} ({asset.locationName}) - {asset.basePrice.toLocaleString()}đ/h
              </option>
            ))}
          </select>
        </div>

        {assetId === 2 && (
          <div className="form-group">
            <label className="form-label">Bố trí bàn ghế (Layout)</label>
            <select 
              value={layoutId} 
              onChange={(e) => setLayoutId(Number(e.target.value))}
              className="form-select"
            >
              <option value={1}>Chữ U (+50,000đ - 15p setup)</option>
              <option value={2}>Lớp học (+0đ - 20p setup)</option>
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group">
            <label className="form-label">Ngày bắt đầu</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Giờ</label>
            <input type="time" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} className="form-input" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group">
            <label className="form-label">Ngày kết thúc</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Giờ</label>
            <input type="time" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)} className="form-input" />
          </div>
        </div>

        <Button type="submit" style={{ marginTop: '10px' }}>Đặt chỗ ngay</Button>
      </form>
    </div>
  );
};
