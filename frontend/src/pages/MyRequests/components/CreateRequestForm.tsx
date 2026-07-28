import React, { useState } from 'react';
import type { AddOnService } from './RequestList';

interface CreateRequestFormProps {
  addOnServices: AddOnService[];
  submitting: boolean;
  onSubmit: (data: {
    type: 'SERVICE' | 'INCIDENT';
    title: string;
    detail: string;
    roomName: string;
    serviceId: number | null;
    quantity: number;
  }) => Promise<void>;
  successMsg: string;
  errorMsg: string;
  setErrorMsg: (val: string) => void;
}

const TYPE_LABEL: Record<string, { label: string; emoji: string }> = {
  SERVICE:  { label: 'Yêu cầu dịch vụ', emoji: '🛎️' },
  INCIDENT: { label: 'Báo sự cố',        emoji: '⚠️' },
};

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({
  addOnServices,
  submitting,
  onSubmit,
  successMsg,
  errorMsg,
  setErrorMsg,
}) => {
  const [reqType, setReqType] = useState<'SERVICE' | 'INCIDENT'>('SERVICE');
  const [title, setTitle] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [detail, setDetail] = useState('');
  const [roomName, setRoomName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setErrorMsg('Vui lòng điền tên phòng.');
      return;
    }

    let payloadTitle = '';
    let payloadServiceId: number | null = null;
    let payloadQuantity = 1;

    if (reqType === 'SERVICE') {
      const selected = addOnServices.find((s) => s.id === Number(selectedServiceId));
      if (!selected) {
        setErrorMsg('Vui lòng chọn một dịch vụ hoặc món nước từ danh mục.');
        return;
      }
      payloadTitle = `Gọi dịch vụ: ${selected.serviceName} (Số lượng: ${quantity})`;
      payloadServiceId = selected.id;
      payloadQuantity = quantity;
    } else {
      if (!title.trim()) {
        setErrorMsg('Vui lòng nhập mô tả sự cố.');
        return;
      }
      payloadTitle = title.trim();
    }

    await onSubmit({
      type: reqType,
      title: payloadTitle,
      detail: detail.trim(),
      roomName: roomName.trim(),
      serviceId: payloadServiceId,
      quantity: payloadQuantity,
    });

    setTitle('');
    setDetail('');
    setSelectedServiceId('');
    setQuantity(1);
  };

  return (
    <div className="panel-card">
      <h2 className="panel-title">Gửi yêu cầu mới</h2>

      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(107, 191, 126, 0.12)',
            border: '1px solid rgba(107, 191, 126, 0.4)',
            color: '#6bbf7e',
            fontSize: '0.88rem',
            fontWeight: '500',
            marginBottom: '16px',
          }}
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            color: '#e07a5f',
            fontSize: '0.85rem',
            marginBottom: '15px',
            fontWeight: '500',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        {/* Loại yêu cầu */}
        <div className="form-group">
          <label className="form-label">Loại yêu cầu</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {(['SERVICE', 'INCIDENT'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setReqType(t);
                  setErrorMsg('');
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${reqType === t ? 'var(--nature-accent)' : 'var(--border-color)'}`,
                  backgroundColor: reqType === t ? 'rgba(212,163,115,0.12)' : 'var(--surface-color)',
                  color: reqType === t ? 'var(--nature-accent)' : 'var(--secondary-text)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'var(--transition)',
                  textAlign: 'center',
                }}
              >
                {TYPE_LABEL[t].emoji}
                <br />
                {TYPE_LABEL[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Tên phòng */}
        <div className="form-group">
          <label className="form-label">Phòng của bạn</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Ví dụ: Phòng họp A2, Lầu 1"
            className="form-input"
            required
          />
        </div>

        {/* Dịch vụ (F&B) hoặc Nhập tự do */}
        {reqType === 'SERVICE' ? (
          <>
            <div className="form-group">
              <label className="form-label">Chọn Đồ uống / Dịch vụ</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : '')}
                className="form-input"
                required
              >
                <option value="">-- Chọn món từ Menu --</option>
                {addOnServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.serviceName} ({s.unitPrice.toLocaleString('vi-VN')} VNĐ)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Số lượng</label>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="form-input"
                required
              />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label className="form-label">Mô tả sự cố</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Điều hòa chảy nước, mất kết nối Wifi"
              className="form-input"
              required
            />
          </div>
        )}

        {/* Chi tiết thêm */}
        <div className="form-group">
          <label className="form-label">Chi tiết bổ sung (tuỳ chọn)</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Ghi chú thêm về yêu cầu hỗ trợ này..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '8px', padding: '12px', fontWeight: '700', fontSize: '0.95rem' }}
        >
          {submitting ? 'Đang gửi...' : '📤 Gửi yêu cầu'}
        </button>
      </form>
    </div>
  );
};
