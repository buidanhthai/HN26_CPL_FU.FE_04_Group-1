import React, { useState } from 'react';
import type { Task } from '../../../../types/task.types';

interface StaffTasksPanelProps {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onCreateTask: (description: string) => void;
}

export const StaffTasksPanel: React.FC<StaffTasksPanelProps> = ({
  tasks,
  onToggleTask,
  onCreateTask,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onCreateTask(newNote.trim());
    setNewNote('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-serif text-white flex items-center justify-between">
        <span>📋 Task Vận Hành (Ca Trực)</span>
        <span className="text-xs font-sans text-amber-500 font-normal">Tự động sinh</span>
      </h3>

      <div className="bg-[#2b201c] rounded-xl p-5 border border-[#3d2e29] space-y-4">
        <p className="text-xs text-stone-400">
          Các công việc chuẩn bị phòng & dọn dẹp do hệ thống tự tạo trước giờ check-in 2 tiếng:
        </p>

        {tasks.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-2">Chưa có task vận hành nào.</p>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {tasks.map((task) => {
              const isDone = task.taskStatus === 'Completed';
              const isAmberSub = task.taskCategory?.includes('Booking') || task.taskCategory?.includes('17:00');
              const isEmeraldSub = isDone || task.taskCategory?.includes('hoàn thành');

              return (
                <div
                  key={task.id}
                  className={`p-3 bg-[#201815] rounded-lg border border-stone-800 flex items-start space-x-3 transition ${
                    isDone ? 'opacity-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => onToggleTask(task)}
                    className="mt-1 accent-amber-600 rounded cursor-pointer w-4 h-4"
                  />
                  <div className="space-y-1 flex-1">
                    <p
                      className={`text-sm font-medium leading-snug ${
                        isDone ? 'text-stone-300 line-through' : 'text-stone-200'
                      }`}
                    >
                      {task.taskDescription || `Nhiệm vụ #${task.id}`}
                    </p>
                    <p
                      className={`text-xs ${
                        isEmeraldSub
                          ? 'text-emerald-400'
                          : isAmberSub
                          ? 'text-amber-500'
                          : 'text-stone-400'
                      }`}
                    >
                      {task.taskCategory || 'Task ca trực'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isAdding ? (
          <form onSubmit={handleAddNote} className="space-y-2 pt-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Nhập ghi chú / công việc ca trực..."
              className="w-full bg-[#1a1412] text-stone-200 border border-stone-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-stone-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-500 font-medium"
              >
                Lưu Task
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 text-xs text-center text-stone-400 hover:text-white bg-stone-800/50 rounded-lg transition border border-stone-700/50 cursor-pointer"
          >
            + Thêm Ghi Chú Ca Trực
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffTasksPanel;
