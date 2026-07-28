import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

interface AddOnService {
  id: number;
  serviceName: string;
  unitPrice: number;
}

interface ServiceRequest {
  id: number;
  type: 'SERVICE' | 'INCIDENT';
  title: string;
  detail: string;
  roomName: string;
  status: 'Pending' | 'In_Progress' | 'Resolved';
  createdAt: string;
}

interface DashboardRequestsPanelProps {
  bookingId: number;
  roomName: string;
  addonServices: AddOnService[];
}

export const DashboardRequestsPanel: React.FC<DashboardRequestsPanelProps> = ({
  bookingId,
  roomName,
  addonServices,
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [reqType, setReqType] = useState<'SERVICE' | 'INCIDENT'>('SERVICE');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get<ServiceRequest[]>('/my-requests');
      const filtered = (res.data || []).filter(
        (r) => r.roomName.toLowerCase().trim() === roomName.toLowerCase().trim()
      );
      setRequests(filtered);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomName) {
      fetchRequests();
    }
  }, [roomName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    let payloadTitle = '';
    let payloadServiceId: number | null = null;
    let payloadQuantity = 1;

    if (reqType === 'SERVICE') {
      const selected = addonServices.find((s) => s.id === Number(selectedServiceId));
      if (!selected) {
        setErrorMsg('Vui lòng chọn món nước từ danh mục.');
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

    setSubmitting(true);
    try {
      await api.post('/my-requests', {
        bookingId,
        requestType: reqType,
        title: payloadTitle,
        detail: detail.trim(),
        roomName: roomName.trim(),
        serviceId: payloadServiceId,
        quantity: payloadQuantity,
      });

      setSuccessMsg('✅ Gửi yêu cầu hỗ trợ thành công!');
      setTitle('');
      setDetail('');
      setSelectedServiceId('');
      setQuantity(1);
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="panel-card" 
      style={{ 
        backgroundColor: 'var(--surface-color)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '16px',
        padding: '20px',
        marginTop: '24px'
      }}
    >
      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', color: 'var(--primary-text)', marginBottom: '16px' }}>
        🛎️ Hỗ Trợ & Báo Sự Cố Cho Phòng: <span style={{ color: 'var(--nature-accent)' }}>{roomName}</span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        <div>
          <h4 style={{ color: 'var(--primary-text)', fontSize: '0.95rem', marginBottom: '12px' }}>Gửi yêu cầu hỗ trợ mới</h4>
          {successMsg && <div style={{ color: '#6bbf7e', fontSize: '0.85rem', marginBottom: '10px' }}>{successMsg}</div>}
          {errorMsg && <div style={{ color: '#e07a5f', fontSize: '0.85rem', marginBottom: '10px' }}>⚠️ {errorMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              {(['SERVICE', 'INCIDENT'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setReqType(t);
                    setErrorMsg('');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `2px solid ${reqType === t ? 'var(--nature-accent)' : 'var(--border-color)'}`,
                    backgroundColor: reqType === t ? 'rgba(212,163,115,0.1)' : 'var(--surface-color)',
                    color: reqType === t ? 'var(--nature-accent)' : 'var(--secondary-text)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}
                >
                  {t === 'SERVICE' ? '🛎️ Gọi Dịch Vụ' : '⚠️ Báo Sự Cố'}
                </button>
              ))}
            </div>

            {reqType === 'SERVICE' ? (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Chọn món uống / đồ dùng</label>
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
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Số lượng</label>
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
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Mô tả sự cố kỹ thuật</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Lỗi cổng HDMI máy chiếu, điều hòa không lạnh..."
                  className="form-input"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Ghi chú chi tiết (tùy chọn)</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Mô tả thêm..."
                className="form-textarea"
                rows={2}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu ngay'}
            </button>
          </form>
        </div>

        <div>
          <h4 style={{ color: 'var(--primary-text)', fontSize: '0.95rem', marginBottom: '12px' }}>Yêu cầu đã gửi của phòng này</h4>
          {loading ? (
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.8rem' }}>Đang tải...</p>
          ) : requests.length === 0 ? (
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.8rem' }}>Chưa có yêu cầu nào cho phòng này.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '5px' }}>
              {requests.map((r) => {
                const badgeColor = r.status === 'Pending' ? '#d4a373' : r.status === 'In_Progress' ? '#4fa3d1' : '#6bbf7e';
                return (
                  <div
                    key={r.id}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-text)' }}>
                        {r.type === 'SERVICE' ? '🛎️ Dịch vụ' : '⚠️ Sự cố'}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: badgeColor + '22',
                        color: badgeColor,
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {r.status === 'Pending' ? 'Chờ xử lý' : r.status === 'In_Progress' ? 'Đang xử lý' : 'Đã xong'}
                      </span>
                    </div>
                    <div style={{ color: 'white', fontWeight: '500' }}>{r.title}</div>
                    {r.detail && <div style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', marginTop: '2px' }}>{r.detail}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
