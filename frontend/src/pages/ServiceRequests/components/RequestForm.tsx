import React, { useState } from 'react';

interface AddOnService {
  id: number;
  serviceName: string;
  unitPrice: number;
}

interface RequestFormProps {
  activeBookings: any[];
  selectedBookingId: number | '';
  onBookingChange: (id: number) => void;
  addonServices: AddOnService[];
  onSubmit: (data: { type: 'SERVICE' | 'INCIDENT'; serviceId?: number; quantity?: number; title: string; detail: string }) => Promise<void>;
  submitting: boolean;
  successMsg: string;
  errorMsg: string;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  activeBookings,
  selectedBookingId,
  onBookingChange,
  addonServices,
  onSubmit,
  submitting,
  successMsg,
  errorMsg,
}) => {
  const [tab, setTab] = useState<'SERVICE' | 'INCIDENT'>('SERVICE');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');

  const selectedBooking = activeBookings.find(b => b.id === selectedBookingId);
  const roomName = selectedBooking?.spaceAsset?.assetName || `Phòng #${selectedBooking?.assetId || ''}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'SERVICE') {
      const service = addonServices.find(s => s.id === Number(selectedServiceId));
      if (!service) return;
      onSubmit({
        type: 'SERVICE',
        serviceId: service.id,
        quantity,
        title: `Gọi dịch vụ: ${service.serviceName} (Số lượng: ${quantity})`,
        detail,
      });
    } else {
      onSubmit({
        type: 'INCIDENT',
        title,
        detail,
      });
    }
  };

  return (
    <div className="panel-card" style={{ backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
        Tạo yêu cầu hỗ trợ cho phòng: <span style={{ color: 'var(--nature-accent)' }}>{selectedBookingId ? roomName : 'Chưa chọn'}</span>
      </h3>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label">Chọn đơn đặt chỗ đang hoạt động</label>
        <select
          value={selectedBookingId}
          onChange={(e) => onBookingChange(Number(e.target.value))}
          className="form-input"
          style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
        >
          <option value="">-- Chọn phòng đang hoạt động --</option>
          {activeBookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.spaceAsset?.assetName || `Phòng #${b.assetId}`} (Mã: {b.bookingCode})
            </option>
          ))}
        </select>
      </div>

      {selectedBookingId && (
        <form onSubmit={handleSubmit}>
          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {(['SERVICE', 'INCIDENT'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  border: 'none',
                  backgroundColor: tab === t ? 'var(--accent-color)' : 'rgba(111, 78, 55, 0.1)',
                  color: tab === t ? 'white' : 'var(--secondary-text)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
              >
                {t === 'SERVICE' ? '🛎️ Gọi Dịch Vụ' : '⚠️ Báo Sự Cố'}
              </button>
            ))}
          </div>

          {successMsg && <div style={{ color: '#6bbf7e', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>{successMsg}</div>}
          {errorMsg && <div style={{ color: '#e07a5f', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>⚠️ {errorMsg}</div>}

          {tab === 'SERVICE' ? (
            <>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Chọn món uống / đồ dùng</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : '')}
                  className="form-input"
                  required
                >
                  <option value="">-- Chọn dịch vụ từ Menu --</option>
                  {addonServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceName} ({s.unitPrice.toLocaleString('vi-VN')} VNĐ)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Số lượng</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="form-input"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Mô tả sự cố kỹ thuật</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Hỏng HDMI máy chiếu, điều hòa chảy nước..."
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tải ảnh sự cố lên (tùy chọn)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  style={{ padding: '6px' }}
                />
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Ghi chú chi tiết (tùy chọn)</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Mô tả thêm yêu cầu..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 'bold', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
          </button>
        </form>
      )}
    </div>
  );
};
