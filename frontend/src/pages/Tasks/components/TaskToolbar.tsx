import React from 'react';

interface TaskToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  assignedToMe: boolean;
  setAssignedToMe: (val: boolean) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (val: 'asc' | 'desc') => void;
  onRefresh: () => void;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  category,
  setCategory,
  assignedToMe,
  setAssignedToMe,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onRefresh,
}) => {
  return (
    <div className="panel-card mb-6" style={{ padding: '16px' }}>
      <div className="flex-col gap-4">
        {/* Row 1: Search and Main filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Tìm mã phòng, mã booking, mô tả..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select text-xs"
              style={{ width: '130px', padding: '6px 12px' }}
            >
              <option value="">-- Trạng thái --</option>
              <option value="Unassigned">Chưa nhận việc</option>
              <option value="In_Progress">Đang thực hiện</option>
              <option value="Completed">Đã hoàn thành</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="form-select text-xs"
              style={{ width: '130px', padding: '6px 12px' }}
            >
              <option value="">-- Độ ưu tiên --</option>
              <option value="URGENT">🚨 Khẩn cấp</option>
              <option value="HIGH">Cao</option>
              <option value="MEDIUM">Thường</option>
              <option value="LOW">Thấp</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select text-xs"
              style={{ width: '130px', padding: '6px 12px' }}
            >
              <option value="">-- Phân loại --</option>
              <option value="LOGISTICS">LOGISTICS</option>
              <option value="CLEANING">CLEANING</option>
              <option value="TECHNICAL">TECHNICAL</option>
              <option value="F&B">F&B</option>
              <option value="FRONT DESK">FRONT DESK</option>
            </select>
          </div>
        </div>

        {/* Row 2: Sort and My Tasks checkbox */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-stone-800 pt-3">
          <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
            <input
              type="checkbox"
              checked={assignedToMe}
              onChange={(e) => setAssignedToMe(e.target.checked)}
              className="accent-amber-600 rounded cursor-pointer w-4 h-4"
            />
            <span>📋 Chỉ hiển thị nhiệm vụ của tôi</span>
          </label>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select text-xs"
              style={{ width: '140px', padding: '4px 8px', height: 'auto' }}
            >
              <option value="createdAt">Mới tạo trước</option>
              <option value="deadline">Hạn chót (Deadline)</option>
              <option value="priority">Độ ưu tiên</option>
              <option value="roomNumber">Số phòng</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary text-xs"
              style={{ padding: '4px 8px', minWidth: 'auto', height: 'auto' }}
              title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            >
              {sortOrder === 'asc' ? '▲' : '▼'}
            </button>
            <button
              onClick={onRefresh}
              className="btn btn-secondary text-xs"
              style={{ padding: '4px 8px', minWidth: 'auto', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Làm mới danh sách"
            >
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
