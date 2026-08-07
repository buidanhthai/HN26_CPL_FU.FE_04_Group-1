import React, { useState } from 'react';
import dayjs from 'dayjs';
import type { Task } from '../../../../types/task.types';
import { TaskHistoryTimeline } from '../../../Tasks/components/TaskHistoryTimeline';

interface StaffTasksPanelProps {
  tasks: Task[];
  userId?: number;
  onClaimTask: (id: number) => void;
  onToggleTask: (task: Task) => void;
  onCreateTask: (description: string) => void;
}

const getPriorityWeight = (p: string) => {
  const upper = (p || '').toUpperCase();
  if (upper.includes('URGENT')) return 4;
  if (upper.includes('HIGH')) return 3;
  if (upper.includes('MED')) return 2;
  if (upper.includes('LOW')) return 1;
  return 0;
};

export const StaffTasksPanel: React.FC<StaffTasksPanelProps> = ({
  tasks,
  userId,
  onClaimTask,
  onToggleTask,
  onCreateTask,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showCompletedList, setShowCompletedList] = useState(false);
  const [showLogs, setShowLogs] = useState<Record<number, boolean>>({});
  const now = dayjs();

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onCreateTask(newNote.trim());
    setNewNote('');
    setIsAdding(false);
  };

  // Filter Active vs Completed Tasks
  const activeTasks = tasks.filter((t) => t.taskStatus !== 'Completed');
  const completedTasks = tasks.filter((t) => t.taskStatus === 'Completed');

  // Sort Active Tasks by Priority (highest first)
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

  // Group active tasks by booking code
  const groupedActiveTasks = (() => {
    const groups: Record<string, { bookingCode?: string; roomNumber?: string; tasks: Task[] }> = {};
    sortedActiveTasks.forEach((t) => {
      const key = t.bookingCode || 'GENERAL';
      if (!groups[key]) {
        groups[key] = {
          bookingCode: t.bookingCode,
          roomNumber: t.roomNumber,
          tasks: []
        };
      }
      groups[key].tasks.push(t);
    });
    return Object.entries(groups);
  })();

  const renderTaskRow = (task: Task) => {
    const isDone = task.taskStatus === 'Completed';
    const isUnassigned = task.taskStatus === 'Unassigned';
    const isAssignedToMe = task.assignedStaff?.id === userId;

    // Deadline warning borders
    let borderClass = 'border-[var(--border-color)]';
    let delayText = '';
    if (task.deadline && !isDone) {
      const dl = dayjs(task.deadline);
      const diffMin = dl.diff(now, 'minute');
      if (diffMin < 0) {
        borderClass = 'border-red-500 animate-pulse border-2';
        delayText = ` 🚨 Trễ hạn ${Math.abs(diffMin)} phút`;
      } else if (diffMin <= 30) {
        borderClass = 'border-amber-500 border-2';
        delayText = ` ⏱️ Sắp hết hạn (${diffMin} phút)`;
      }
    }

    const isAuto = task.taskCategory === 'LOGISTICS' || task.taskCategory === 'CLEANING';

    return (
      <div
        key={task.id}
        className={`p-3 bg-[var(--background-color)] rounded-lg border ${borderClass} flex items-start space-x-3 transition ${isDone ? 'opacity-60' : ''
          }`}
        style={{
          boxShadow: isDone ? 'none' : '0 2px 4px rgba(60,42,33,0.02)',
          transition: 'all 0.2s ease'
        }}
      >
        {!isDone && !isUnassigned && isAssignedToMe ? (
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onToggleTask(task)}
            className="mt-1 accent-amber-600 rounded cursor-pointer w-4 h-4"
          />
        ) : (
          <div className="w-4 h-4 mt-1 border border-[var(--border-color)] rounded bg-[var(--surface-color)] flex items-center justify-center text-[10px] text-[var(--secondary-text)]">
            {isDone ? '✓' : '👤'}
          </div>
        )}

        <div className="space-y-1 flex-1 text-left">
          <p
            className={`text-sm font-semibold leading-snug m-0 ${isDone ? 'text-[var(--secondary-text)] line-through opacity-70' : 'text-[var(--primary-text)]'
              }`}
          >
            {task.taskDescription || `Nhiệm vụ #${task.id}`}
            {delayText && <span className="text-xs font-bold block mt-0.5 text-red-650">{delayText}</span>}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--secondary-text)]">
              {task.taskCategory}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-color)] text-[var(--secondary-text)] border border-[var(--border-color)]">
              {isAuto ? '🤖 Hệ thống' : '📝 Thủ công'}
            </span>
            <span className={`badge text-[10px] priority-${task.priority.toLowerCase()} font-bold px-1.5 py-0.5 rounded border`}>
              {task.priority}
            </span>
            {task.assignedStaff && (
              <span className="text-[10px] text-amber-650 font-semibold">
                👤 {isAssignedToMe ? 'Bạn nhận' : task.assignedStaff.fullName}
              </span>
            )}
          </div>

          <div style={{ marginTop: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLogs(prev => ({ ...prev, [task.id]: !prev[task.id] }));
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
              <span>{showLogs[task.id] ? 'Ẩn lịch sử 📋' : 'Xem lịch sử thao tác 📋'}</span>
            </button>
            {showLogs[task.id] && <TaskHistoryTimeline logs={task.taskLogs} />}
          </div>
        </div>

        {isUnassigned && !isDone && (
          <button
            onClick={() => onClaimTask(task.id)}
            className="btn btn-primary text-[10px] py-1 px-2.5 min-w-auto cursor-pointer font-bold"
            style={{ height: 'auto', padding: '4px 8px' }}
          >
            Nhận
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-serif text-[var(--primary-text)] flex items-center justify-between m-0">
        <span>📋 Task Vận Hành (Ca Trực)</span>
        <span className="text-xs font-sans text-amber-600 font-normal">Đồng bộ liên tục</span>
      </h3>

      <div className="bg-[var(--surface-color)] rounded-xl p-5 border border-[var(--border-color)] space-y-4 shadow-md">
        {sortedActiveTasks.length === 0 ? (
          <p className="text-xs text-[var(--secondary-text)] italic py-2 m-0 text-center">🎉 Không có task nào cần làm.</p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {groupedActiveTasks.map(([key, group]) => {
              if (key === 'GENERAL') {
                return (
                  <div key={key} className="p-4 bg-[var(--background-color)] rounded-xl border border-[var(--border-color)] space-y-3" style={{ textAlign: 'left' }}>
                    <h4 className="text-xs font-bold m-0 text-[var(--secondary-text)] flex items-center gap-1.5 uppercase tracking-wider">
                      📌 Nhiệm vụ chung / ca trực
                    </h4>
                    <div className="space-y-2">
                      {group.tasks.map(renderTaskRow)}
                    </div>
                  </div>
                );
              }

              // Booking group: get the highest priority in the group
              const highestPriority = group.tasks.reduce((highest, t) => {
                const currentWeight = getPriorityWeight(t.priority);
                const highestWeight = getPriorityWeight(highest);
                return currentWeight > highestWeight ? t.priority : highest;
              }, 'LOW');

              return (
                <div 
                  key={key} 
                  className="bg-[var(--surface-color)] rounded-xl p-4 border border-[var(--border-color)] space-y-3 shadow-sm hover:shadow-md transition"
                  style={{ textAlign: 'left', borderLeft: '4px solid var(--accent-color, #8b5a2b)' }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2 pb-2 border-b border-[var(--border-color)]">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--primary-text)] m-0 flex items-center gap-2">
                        🔑 {group.roomNumber || 'Phòng họp / Không gian'}
                      </h4>
                      <p className="text-[var(--secondary-text)] text-[10px] m-0 mt-0.5">
                        Mã Booking: <strong className="text-[var(--primary-text)]">{key}</strong>
                      </p>
                    </div>
                    <span className={`badge text-[10px] priority-${highestPriority.toLowerCase()} font-bold px-2 py-0.5 rounded border`}>
                      {highestPriority}
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {group.tasks.map(renderTaskRow)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Collapsible Completed Tasks list */}
        {completedTasks.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px' }}>
            <button
              onClick={() => setShowCompletedList(!showCompletedList)}
              className="flex items-center gap-2 w-full text-left"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary-text)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <span>✅ Lịch sử hoàn thành ({completedTasks.length})</span>
              <i className={`fa-solid ${showCompletedList ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: '0.65rem' }}></i>
            </button>

            {showCompletedList && (
              <div className="space-y-3 mt-3 max-h-[250px] overflow-y-auto pr-1">
                {completedTasks.map(renderTaskRow)}
              </div>
            )}
          </div>
        )}

        {isAdding ? (
          <form onSubmit={handleAddNote} className="space-y-2 pt-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Nhập ghi chú / công việc ca trực..."
              className="w-full bg-[var(--background-color)] text-[var(--primary-text)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-[var(--secondary-text)] hover:text-[var(--primary-text)] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-500 font-semibold cursor-pointer"
              >
                Lưu Task
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 text-xs text-center text-[var(--secondary-text)] hover:text-[var(--primary-text)] bg-[var(--background-color)] rounded-lg transition border border-[var(--border-color)] cursor-pointer font-semibold"
          >
            + Thêm Ghi Chú Ca Trực
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffTasksPanel;
