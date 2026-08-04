import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UserRequest {
  id: number;
  type: 'SERVICE' | 'INCIDENT';
  title: string;
  detail: string;
  roomName: string;
  customerName: string;
  status: 'Pending' | 'In_Progress' | 'Resolved';
  createdAt: string;
  resolvedNote?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Pending:     { label: 'Chờ xử lý',     color: '#d4a373', bg: 'rgba(212,163,115,0.12)' },
  In_Progress: { label: 'Đang xử lý',    color: '#4fa3d1', bg: 'rgba(79,163,209,0.12)'  },
  Resolved:    { label: 'Đã giải quyết', color: '#6bbf7e', bg: 'rgba(107,191,126,0.12)' },
};

const TYPE_CONFIG: Record<string, { label: string; emoji: string; borderColor: string }> = {
  SERVICE:  { label: 'Yêu cầu dịch vụ', emoji: '🛎️', borderColor: '#d4a373' },
  INCIDENT: { label: 'Báo sự cố',        emoji: '⚠️', borderColor: '#e07a5f' },
};



// ─── Component ─────────────────────────────────────────────────────────────────
const UserRequestsManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const staffName = auth?.user?.fullName ?? 'Nhân viên';

  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'In_Progress' | 'Resolved'>('all');
  const [filterType, setFilterType] = useState<'all' | 'SERVICE' | 'INCIDENT'>('all');

  // Modal giải quyết
  const [resolving, setResolving] = useState<UserRequest | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [saving, setSaving] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchRequests = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get<UserRequest[]>('/user-requests');
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching user requests:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(true);
    const interval = setInterval(() => {
      fetchRequests(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ─── Cập nhật trạng thái nhanh ────────────────────────────────────────────
  const handleQuickUpdate = async (req: UserRequest, newStatus: 'In_Progress' | 'Resolved') => {
    if (newStatus === 'Resolved') {
      setResolving(req);
      setResolveNote('');
      return;
    }
    try {
      const res = await api.patch<UserRequest>(`/user-requests/${req.id}`, { status: newStatus });
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? res.data : r))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // ─── Submit giải quyết kèm ghi chú ───────────────────────────────────────
  const handleResolveSubmit = async () => {
    if (!resolving) return;
    setSaving(true);
    try {
      const res = await api.patch<UserRequest>(`/user-requests/${resolving.id}`, {
        status: 'Resolved',
        resolvedNote: resolveNote || `Đã xử lý bởi ${staffName}.`,
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === resolving.id ? res.data : r))
      );
      setResolving(null);
    } catch (err) {
      console.error('Error resolving request:', err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Filter ───────────────────────────────────────────────────────────────
  const displayed = requests.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchType   = filterType   === 'all' || r.type   === filterType;
    return matchStatus && matchType;
  });

  const countByStatus = (s: string) => requests.filter((r) => r.status === s).length;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
    });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🎧 Giải quyết Yêu cầu Khách</h1>
        <button
          onClick={() => fetchRequests(true)}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '8px' }}
        >
          🔄 Làm mới
        </button>
      </div>
      <p className="page-desc">
        Theo dõi và xử lý toàn bộ yêu cầu dịch vụ &amp; sự cố do khách gửi trong phiên làm việc.
      </p>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {(['Pending', 'In_Progress', 'Resolved'] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              style={{
                padding: '18px 22px',
                borderRadius: '12px',
                border: `2px solid ${filterStatus === s ? cfg.color : 'var(--border-color)'}`,
                backgroundColor: filterStatus === s ? cfg.bg : 'var(--surface-color)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: cfg.color }}>
                {countByStatus(s)}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--secondary-text)', marginTop: '2px' }}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: 'var(--secondary-text)', fontSize: '0.85rem' }}>Lọc theo loại:</span>
        {(['all', 'SERVICE', 'INCIDENT'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: `1px solid ${filterType === t ? 'var(--nature-accent)' : 'var(--border-color)'}`,
              backgroundColor: filterType === t ? 'rgba(212,163,115,0.15)' : 'transparent',
              color: filterType === t ? 'var(--nature-accent)' : 'var(--secondary-text)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '600',
              transition: 'var(--transition)',
            }}
          >
            {t === 'all' ? 'Tất cả' : TYPE_CONFIG[t].emoji + ' ' + TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* ── List ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="panel-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-text)' }}>
          Đang tải danh sách yêu cầu...
        </div>
      ) : displayed.length === 0 ? (
        <div className="panel-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <p style={{ color: 'var(--secondary-text)' }}>
            {requests.length === 0 ? 'Chưa có yêu cầu nào.' : 'Không có yêu cầu phù hợp với bộ lọc.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displayed.map((req) => {
            const typeInfo   = TYPE_CONFIG[req.type];
            const statusInfo = STATUS_CONFIG[req.status];
            const isPending  = req.status === 'Pending';
            const isInProg   = req.status === 'In_Progress';

            return (
              <div
                key={req.id}
                className="panel-card"
                style={{
                  padding: '20px 24px',
                  borderLeft: `4px solid ${typeInfo.borderColor}`,
                  opacity: req.status === 'Resolved' ? 0.75 : 1,
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Left: info */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '3px 9px',
                        backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 'bold',
                        color: 'var(--secondary-text)',
                      }}>
                        {typeInfo.emoji} {typeInfo.label}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}55`,
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary-text)', marginBottom: '4px' }}>
                      {req.title}
                    </div>

                    {req.detail && (
                      <div style={{ fontSize: '0.83rem', color: 'var(--secondary-text)', marginBottom: '6px' }}>
                        {req.detail}
                      </div>
                    )}

                    <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>👤 {req.customerName}</span>
                      <span>🏠 {req.roomName}</span>
                      <span>🕐 {formatTime(req.createdAt)}</span>
                    </div>

                    {req.resolvedNote && (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(107,191,126,0.08)',
                        border: '1px solid rgba(107,191,126,0.3)',
                        fontSize: '0.8rem',
                        color: '#6bbf7e',
                      }}>
                        ✍️ Ghi chú xử lý: {req.resolvedNote}
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    {isPending && (
                      <button
                        onClick={() => handleQuickUpdate(req, 'In_Progress')}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '8px' }}
                      >
                        ▶ Tiếp nhận
                      </button>
                    )}
                    {(isPending || isInProg) && (
                      <button
                        onClick={() => handleQuickUpdate(req, 'Resolved')}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '8px' }}
                      >
                        ✅ Đánh dấu giải quyết
                      </button>
                    )}
                    {req.status === 'Resolved' && (
                      <span style={{ fontSize: '0.78rem', color: '#6bbf7e' }}>Đã hoàn tất</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Resolve Modal ─────────────────────────────────────────────── */}
      {resolving && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px 32px',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--primary-text)' }}>
              ✅ Xác nhận giải quyết
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
              Yêu cầu: <strong style={{ color: 'var(--primary-text)' }}>{resolving.title}</strong>
            </p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Ghi chú xử lý (hiển thị cho khách)</label>
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder={`Ví dụ: Đã giao 2 ly cà phê sữa đá lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.`}
                className="form-textarea"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setResolving(null)}
                className="btn"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--secondary-text)',
                  cursor: 'pointer',
                }}
              >
                Huỷ
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={saving}
                className="btn btn-primary"
                style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: '700' }}
              >
                {saving ? 'Đang lưu...' : 'Xác nhận giải quyết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequestsManagement;
