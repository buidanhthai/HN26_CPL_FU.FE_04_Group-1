import React from 'react';
import type { Task } from '../../../types/task.types';

interface TaskPoolProps {
  tasks: Task[];
  loading: boolean;
  userRole?: string;
  onUpdateStatus: (task: Task, newStatus: string) => void;
  onDelete: (id: number) => void;
}

export const TaskPool: React.FC<TaskPoolProps> = ({
  tasks,
  loading,
  userRole,
  onUpdateStatus,
  onDelete,
}) => {
  if (loading) {
    return <p className="page-desc">Đang tải danh sách công việc...</p>;
  }

  if (tasks.length === 0) {
    return <p className="page-desc">Chưa có công việc nào trong hàng đợi.</p>;
  }

  return (
    <div className="panel-card">
      <h2 className="panel-title">Task Pool (Hàng đợi tự nhận việc)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {tasks.map((t) => (
          <div 
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: t.taskStatus === 'Completed' ? 'rgba(111, 78, 55, 0.05)' : 'var(--background-color)',
              border: '1px solid var(--border-color)',
              opacity: t.taskStatus === 'Completed' ? 0.75 : 1,
              transition: 'var(--transition)',
              boxShadow: '0 2px 4px rgba(60, 42, 33, 0.02)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: 'var(--secondary-text)'
                }}>
                  {t.taskCategory}
                </span>
                <span className={`badge ${
                  t.taskStatus === 'Unassigned' ? 'badge-unassigned' :
                  t.taskStatus === 'In_Progress' ? 'badge-inprogress' : 'badge-completed'
                }`}>
                  {t.taskStatus}
                </span>
              </div>
              <div style={{
                fontWeight: '600',
                fontSize: '0.95rem',
                textDecoration: t.taskStatus === 'Completed' ? 'line-through' : 'none',
                color: t.taskStatus === 'Completed' ? 'var(--secondary-text)' : 'var(--primary-text)'
              }}>
                {t.taskDescription}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                Mã đặt chỗ: #{t.bookingId} | Số nhân viên yêu cầu: {t.requiredStaffCount}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              {t.taskStatus === 'Unassigned' && userRole === 'STAFF' && (
                <button 
                  onClick={() => onUpdateStatus(t, 'In_Progress')}
                  className="btn btn-primary"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}
                >
                  Nhận việc
                </button>
              )}
              {t.taskStatus === 'In_Progress' && userRole === 'STAFF' && (
                <button 
                  onClick={() => onUpdateStatus(t, 'Completed')}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}
                >
                  Hoàn thành
                </button>
              )}
              {(userRole === 'ADMIN' || userRole === 'STAFF') && (
                <button 
                  onClick={() => onDelete(t.id)}
                  className="btn-link-danger"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
