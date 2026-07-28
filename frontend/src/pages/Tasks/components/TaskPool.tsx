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
      <div className="task-list">
        {tasks.map((t) => (
          <div 
            key={t.id}
            className={`task-item${t.taskStatus === 'Completed' ? ' task-item-completed' : ''}`}
          >
            <div className="flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="task-item-category">
                  {t.taskCategory}
                </span>
                <span className={`badge ${
                  t.taskStatus === 'Unassigned' ? 'badge-unassigned' :
                  t.taskStatus === 'In_Progress' ? 'badge-inprogress' : 'badge-completed'
                }`}>
                  {t.taskStatus}
                </span>
              </div>
              <div className={t.taskStatus === 'Completed' ? 'task-item-desc task-item-desc-completed' : 'task-item-desc'}>
                {t.taskDescription}
              </div>
              <div className="text-xs text-secondary">
                Mã đặt chỗ: #{t.bookingId} | Số nhân viên yêu cầu: {t.requiredStaffCount}
              </div>
            </div>
            
            <div className="flex-col gap-2 align-end">
              {t.taskStatus === 'Unassigned' && userRole === 'STAFF' && (
                <button 
                  onClick={() => onUpdateStatus(t, 'In_Progress')}
                  className="btn btn-primary text-xs"
                  style={{ padding: '6px 12px', borderRadius: '6px' }}
                >
                  Nhận việc
                </button>
              )}
              {t.taskStatus === 'In_Progress' && userRole === 'STAFF' && (
                <button 
                  onClick={() => onUpdateStatus(t, 'Completed')}
                  className="btn btn-secondary text-xs"
                  style={{ padding: '6px 12px', borderRadius: '6px' }}
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
