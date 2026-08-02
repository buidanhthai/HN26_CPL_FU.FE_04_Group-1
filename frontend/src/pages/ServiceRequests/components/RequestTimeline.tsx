import React from 'react';

interface ServiceRequest {
  id: number;
  type: 'SERVICE' | 'INCIDENT';
  title: string;
  detail: string;
  roomName: string;
  status: 'Pending' | 'In_Progress' | 'Resolved';
  createdAt: string;
}

interface RequestTimelineProps {
  requests: ServiceRequest[];
  loading: boolean;
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({ requests, loading }) => {
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: 'rgba(212, 163, 115, 0.15)', color: 'var(--accent-color)' };
      case 'In_Progress':
        return { backgroundColor: 'rgba(79, 163, 209, 0.15)', color: '#4fa3d1' };
      case 'Resolved':
        return { backgroundColor: 'rgba(107, 191, 126, 0.15)', color: '#6bbf7e' };
      default:
        return { backgroundColor: 'rgba(128, 128, 128, 0.15)', color: '#888' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Chờ xử lý';
      case 'In_Progress':
        return 'Đang xử lý';
      case 'Resolved':
        return 'Đã xong';
      default:
        return status;
    }
  };

  // Sort reverse chronologically
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="panel-card" style={{ backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', height: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
        Dòng thời gian yêu cầu (Timeline)
      </h3>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : sortedRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--secondary-text)' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📅</span>
          Chưa có yêu cầu hỗ trợ nào được gửi cho phòng này.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '450px',
          overflowY: 'auto',
          paddingRight: '6px',
          position: 'relative'
        }}>
          {/* Vertical line indicator */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            backgroundColor: 'var(--border-color)',
            zIndex: 1
          }} />

          {sortedRequests.map((r) => {
            const badge = getBadgeStyles(r.status);
            const timeStr = new Date(r.createdAt).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            });

            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  gap: '15px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Timeline dot */}
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: r.status === 'Resolved' ? '#6bbf7e' : 'var(--accent-color)',
                  border: '4px solid var(--surface-color)',
                  marginLeft: '6px',
                  marginTop: '15px'
                }} />

                {/* Card details */}
                <div style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: 'var(--primary-text)'
                    }}>
                      {r.type === 'SERVICE' ? '🛎️ Gọi dịch vụ' : '⚠️ Báo sự cố'}
                    </span>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      ...badge
                    }}>
                      {getStatusText(r.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--primary-text)', marginBottom: '4px' }}>
                    {r.title}
                  </div>
                  {r.detail && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontStyle: 'italic', marginBottom: '8px' }}>
                      &ldquo;{r.detail}&rdquo;
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: 'var(--secondary-text)' }}>
                    Thời gian gửi: {timeStr}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
