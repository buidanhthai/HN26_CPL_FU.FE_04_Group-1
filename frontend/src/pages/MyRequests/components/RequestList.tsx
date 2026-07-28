import React from 'react';

export interface ServiceRequest {
  id: number;
  type: 'SERVICE' | 'INCIDENT';
  title: string;
  detail: string;
  roomName: string;
  status: 'Pending' | 'In_Progress' | 'Resolved';
  createdAt: string;
}

export interface AddOnService {
  id: number;
  serviceName: string;
  unitPrice: number;
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

interface RequestListProps {
  requests: ServiceRequest[];
  loading: boolean;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, loading }) => {
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

  if (loading) {
    return <p className="page-desc">Đang tải...</p>;
  }

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-text)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
        <p>Bạn chưa có yêu cầu nào. Hãy gửi yêu cầu đầu tiên!</p>
      </div>
    );
  }

  return (
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
                    {typeInfo?.emoji || '🛎️'} {typeInfo?.label || r.type}
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
                  🏠 {r.roomName} &nbsp;·&nbsp;  🕐 {formatTime(r.createdAt)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
