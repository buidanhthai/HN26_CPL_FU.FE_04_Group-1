import React, { useState } from 'react';
import type { Task } from '../../../types/task.types';
import { TaskHistoryTimeline } from './TaskHistoryTimeline';

interface TaskPoolProps {
  tasks: Task[];
  loading: boolean;
  userRole?: string;
  userId?: number;
  onClaim: (id: number) => void;
  onComplete: (id: number, completionNote?: string, evidenceImageUrl?: string) => void;
  onUnassign: (id: number) => void;
  onDelete: (id: number) => void;
}

const getPriorityWeight = (p: string) => {
  const upper = (p || '').toUpperCase();
  if (upper.includes('URGENT')) return 4;
  if (upper.includes('HIGH')) return 3;
  if (upper.includes('MED')) return 2;
  if (upper.includes('LOW')) return 1;
  return 0;
};

export const TaskPool: React.FC<TaskPoolProps> = ({
  tasks,
  loading,
  userRole,
  userId,
  onClaim,
  onComplete,
  onUnassign,
  onDelete,
}) => {
  const [evidenceNote, setEvidenceNote] = useState<Record<number, string>>({});
  const [evidenceImg, setEvidenceImg] = useState<Record<number, string>>({});
  const [showCompleteForm, setShowCompleteForm] = useState<Record<number, boolean>>({});
  const [showCompletedList, setShowCompletedList] = useState(false);
  const [showLogs, setShowLogs] = useState<Record<number, boolean>>({});

  if (loading) {
    return (
      <div className="panel-card" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Filter Active vs Completed Tasks
  const activeTasks = tasks.filter((t) => t.taskStatus !== 'Completed');
  const completedTasks = tasks.filter((t) => t.taskStatus === 'Completed');

  // Sort Active Tasks by Priority (highest first), then by oldest deadline/creation time
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    const pA = getPriorityWeight(a.priority);
    const pB = getPriorityWeight(b.priority);
    if (pA !== pB) return pB - pA;
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return b.id - a.id;
  });

  const renderTaskItem = (t: Task) => {
    const isCompleted = t.taskStatus === 'Completed';
    const isAssignedToMe = t.assignedStaff?.id === userId;
    const hasOwner = !!t.assignedStaff;

    return (
      <div 
        key={t.id}
        className={`task-item ${isCompleted ? 'task-item-completed' : ''}`}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: isCompleted ? 'rgba(111, 78, 55, 0.05)' : 'var(--background-color)',
          border: '1px solid var(--border-color)',
          boxShadow: isCompleted ? 'none' : '0 4px 6px -1px rgba(60,42,33,0.04), 0 2px 4px -1px rgba(60,42,33,0.02)',
          transition: 'all 0.2s ease-in-out',
          opacity: isCompleted ? 0.75 : 1
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="task-item-category" style={{
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
            <span className={`badge badge-${t.taskStatus.toLowerCase().replace('_', '')} text-xs font-semibold px-2 py-0.5 rounded border ${
              t.taskStatus === 'Unassigned' 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : t.taskStatus === 'In_Progress' 
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {t.taskStatus === 'Unassigned' ? 'Chưa nhận' : t.taskStatus === 'In_Progress' ? 'Đang làm' : 'Hoàn thành'}
            </span>
            <span className={`badge text-xs priority-${t.priority.toLowerCase()} font-bold px-2 py-0.5 rounded border`}>
              {t.priority}
            </span>
          </div>
          <div style={{
            fontWeight: '600',
            fontSize: '0.95rem',
            color: 'var(--primary-text)',
            textDecoration: isCompleted ? 'line-through' : 'none'
          }}>
            {t.taskDescription}
          </div>
          <div className="text-xs text-[var(--secondary-text)]">
            {t.roomNumber ? `📍 Phòng: ${t.roomNumber} | ` : ''} 
            Mã đơn: #{t.bookingId}
            {t.deadline ? ` | ⏱️ Hạn chót: ${new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </div>

          {hasOwner && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center text-[10px] text-white font-bold">
                {t.assignedStaff?.fullName.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-amber-650 font-semibold">
                {isAssignedToMe ? 'Bạn đang thực hiện' : t.assignedStaff?.fullName}
              </span>
            </div>
          )}

          <div style={{ marginTop: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLogs(prev => ({ ...prev, [t.id]: !prev[t.id] }));
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-color, #4f3d2f)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{showLogs[t.id] ? 'Ẩn lịch sử 📋' : 'Xem lịch sử thao tác 📋'}</span>
            </button>
            {showLogs[t.id] && <TaskHistoryTimeline logs={t.taskLogs} />}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', minWidth: '120px' }}>
          {t.taskStatus === 'Unassigned' && (userRole === 'STAFF' || userRole === 'ADMIN') && (
            <button 
              onClick={() => onClaim(t.id)}
              className="btn btn-primary text-xs cursor-pointer font-bold"
              style={{ padding: '6px 12px', borderRadius: '6px' }}
            >
              Nhận việc
            </button>
          )}

          {t.taskStatus === 'In_Progress' && isAssignedToMe && !showCompleteForm[t.id] && (
            <div className="flex gap-2">
              <button 
                onClick={() => onUnassign(t.id)}
                className="btn btn-secondary text-xs cursor-pointer"
                style={{ padding: '6px 12px', borderRadius: '6px' }}
              >
                Trả việc
              </button>
              <button 
                onClick={() => setShowCompleteForm({ ...showCompleteForm, [t.id]: true })}
                className="btn btn-primary text-xs cursor-pointer font-bold"
                style={{ padding: '6px 12px', borderRadius: '6px' }}
              >
                Hoàn thành
              </button>
            </div>
          )}

          {showCompleteForm[t.id] && (
            <div className="flex flex-col gap-2 mt-2 w-full max-w-[250px] bg-[var(--background-color)] p-3 rounded border border-[var(--border-color)] text-left shadow-sm">
              <label className="text-[10px] text-[var(--secondary-text)] font-semibold">Ghi chú nghiệm thu:</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Đã dọn dẹp sạch sẽ..." 
                className="form-input text-xs" 
                style={{ padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}
                value={evidenceNote[t.id] || ''}
                onChange={(e) => setEvidenceNote({ ...evidenceNote, [t.id]: e.target.value })}
              />
              <label className="text-[10px] text-[var(--secondary-text)] font-semibold mt-1">Ảnh nghiệm thu (URL):</label>
              <input 
                type="text" 
                placeholder="Đường dẫn ảnh..." 
                className="form-input text-xs" 
                style={{ padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}
                value={evidenceImg[t.id] || ''}
                onChange={(e) => setEvidenceImg({ ...evidenceImg, [t.id]: e.target.value })}
              />
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => setShowCompleteForm({ ...showCompleteForm, [t.id]: false })} 
                  className="text-xs text-[var(--secondary-text)] hover:text-[var(--primary-text)] cursor-pointer"
                  style={{ background: 'none', border: 'none' }}
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    onComplete(t.id, evidenceNote[t.id], evidenceImg[t.id]);
                    setShowCompleteForm({ ...showCompleteForm, [t.id]: false });
                  }} 
                  className="btn btn-primary text-[10px] cursor-pointer"
                  style={{ padding: '4px 8px', minWidth: 'auto' }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}

          {(userRole === 'ADMIN' || userRole === 'STAFF') && (
            <button 
              onClick={() => onDelete(t.id)}
              className="text-xs mt-1 text-red-600 hover:text-red-800 cursor-pointer font-semibold"
              style={{ background: 'none', border: 'none' }}
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="panel-card">
      <h2 className="panel-title" style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-text)' }}>
        Task Pool (Bể Điều Phối Ca Trực)
      </h2>
      
      {/* Active Tasks List */}
      <div className="task-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sortedActiveTasks.length === 0 ? (
          <p className="text-sm text-[var(--secondary-text)] italic py-4 text-center m-0">
            🎉 Tuyệt vời! Hiện không có công việc nào cần xử lý.
          </p>
        ) : (
          sortedActiveTasks.map(renderTaskItem)
        )}
      </div>

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && (
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button
            onClick={() => setShowCompletedList(!showCompletedList)}
            className="flex items-center gap-2"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--background-color)',
              border: '1px solid var(--border-color)',
              color: 'var(--secondary-text)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <span>✅ Lịch sử nhiệm vụ đã hoàn thành ({completedTasks.length})</span>
            <i className={`fa-solid ${showCompletedList ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: '0.7rem' }}></i>
          </button>

          {showCompletedList && (
            <div className="task-list mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {completedTasks.map(renderTaskItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
