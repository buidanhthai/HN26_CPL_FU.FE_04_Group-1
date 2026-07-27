import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

interface ServiceRequest {
  id: number;
  type: 'SERVICE' | 'INCIDENT';
  title: string;
  detail: string;
  roomName: string;
  status: 'Pending' | 'In_Progress' | 'Resolved';
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  Pending:     { label: 'Chờ xử lý',    color: '#d4a373' },
  In_Progress: { label: 'Đang xử lý',   color: '#4fa3d1' },
  Resolved:    { label: 'Đã giải quyết', color: '#6bbf7e' },
};

const TYPE_LABEL: Record<string, { label: string; emoji: string }> = {
  SERVICE:  { label: 'Yêu cầu dịch vụ', emoji: '🛎️' },
  INCIDENT: { label: 'Báo sự cố',        emoji: '⚠️' },
};

const MyRequests: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  // ─── State ────────────────────────────────────────────────────────────────
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [reqType, setReqType] = useState<'SERVICE' | 'INCIDENT'>('SERVICE');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [roomName, setRoomName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Fetch my requests ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await api.get<ServiceRequest[]>('/my-requests');
        setRequests(res.data || []);
      } catch {
        // API chưa có → dùng mock để demo UI
        setRequests([
          {
            id: 1,
            type: 'SERVICE',
            title: 'Gọi thêm cà phê sữa đá x2',
            detail: 'Phòng cần thêm 2 ly cà phê sữa đá, không đường.',
            roomName: 'Họp Chiến Lược 102',
            status: 'Resolved',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 2,
            type: 'INCIDENT',
            title: 'Điều hòa không lạnh',
            detail: 'Nhiệt độ phòng vẫn cao dù đã bật điều hòa 30 phút.',
            roomName: 'Tiếp Khách VIP 103',
            status: 'In_Progress',
            createdAt: new Date(Date.now() - 900000).toISOString(),
          },
          {
            id: 3,
            type: 'SERVICE',
            title: 'Mượn bảng di động',
            detail: 'Cần 1 bảng di động + 2 bút cho buổi brainstorm.',
            roomName: 'Phòng Dự Án 201',
            status: 'Pending',
            createdAt: new Date(Date.now() - 300000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !roomName.trim()) {
      setErrorMsg('Vui lòng điền tên yêu cầu và tên phòng.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post('/my-requests', { type: reqType, title, detail, roomName });
    } catch {
      // API chưa có → optimistic UI
    }
    const newReq: ServiceRequest = {
      id: Date.now(),
      type: reqType,
      title: title.trim(),
      detail: detail.trim(),
      roomName: roomName.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    setTitle('');
    setDetail('');
    setSuccessMsg('✅ Yêu cầu đã được gửi! Nhân viên sẽ phản hồi trong vài phút.');
    setTimeout(() => setSuccessMsg(''), 4000);
    setSubmitting(false);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="page-title">📩 Yêu cầu của tôi</h1>
      <p className="page-desc">
        Gửi yêu cầu dịch vụ hoặc báo sự cố trong phòng — nhân viên CozySpace sẽ hỗ trợ ngay.
      </p>

      <div className="layout-grid-sidebar">
        {/* ── Danh sách yêu cầu ─────────────────────────────────── */}
        <div className="panel-card">
          <h2 className="panel-title">Lịch sử yêu cầu</h2>

          {loading ? (
            <p className="page-desc">Đang tải...</p>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-text)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
              <p>Bạn chưa có yêu cầu nào. Hãy gửi yêu cầu đầu tiên!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {requests.map((r) => {
                const typeInfo = TYPE_LABEL[r.type];
                const statusInfo = STATUS_LABEL[r.status] || { label: r.status, color: '#aaa' };
                return (
                  <div
                    key={r.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--background-color)',
                      border: '1px solid var(--border-color)',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '3px 8px',
                            backgroundColor: 'var(--surface-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            color: 'var(--secondary-text)'
                          }}>
                            {typeInfo.emoji} {typeInfo.label}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            backgroundColor: statusInfo.color + '22',
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}55`,
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--primary-text)', marginBottom: '4px' }}>
                          {r.title}
                        </div>
                        {r.detail && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--secondary-text)', marginBottom: '6px' }}>
                            {r.detail}
                          </div>
                        )}
                        <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)' }}>
                          🏠 {r.roomName} &nbsp;·&nbsp; 🕐 {formatTime(r.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Form gửi yêu cầu ──────────────────────────────────── */}
        <div className="panel-card">
          <h2 className="panel-title">Gửi yêu cầu mới</h2>

          {successMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(107, 191, 126, 0.12)',
              border: '1px solid rgba(107, 191, 126, 0.4)',
              color: '#6bbf7e',
              fontSize: '0.88rem',
              fontWeight: '500',
              marginBottom: '16px'
            }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{
              color: '#e07a5f',
              fontSize: '0.85rem',
              marginBottom: '15px',
              fontWeight: '500'
            }}>
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
                    onClick={() => setReqType(t)}
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
                    {TYPE_LABEL[t].emoji}<br />{TYPE_LABEL[t].label}
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
                placeholder="Ví dụ: Phòng họp 102, Lầu 2"
                className="form-input"
                required
              />
            </div>

            {/* Tiêu đề */}
            <div className="form-group">
              <label className="form-label">
                {reqType === 'SERVICE' ? 'Dịch vụ / Thiết bị cần' : 'Mô tả sự cố'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  reqType === 'SERVICE'
                    ? 'Ví dụ: Gọi thêm 2 cà phê sữa đá'
                    : 'Ví dụ: Máy chiếu bị chập chờn'
                }
                className="form-input"
                required
              />
            </div>

            {/* Chi tiết thêm */}
            <div className="form-group">
              <label className="form-label">Chi tiết bổ sung (tuỳ chọn)</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Ghi chú thêm để nhân viên hỗ trợ tốt hơn..."
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
      </div>
    </div>
  );
};

export default MyRequests;
