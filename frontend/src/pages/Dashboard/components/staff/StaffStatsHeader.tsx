import React from 'react';

interface StaffStatsHeaderProps {
  activeCount: number;
  totalRooms: number;
  overdueCount: number;
  firstOverdueCustomer?: string;
  upcomingCount: number;
  pendingTaskCount: number;
  activeFilter: 'ACTIVE' | 'OVERDUE' | 'UPCOMING' | 'TASKS';
  onChangeFilter: (filter: 'ACTIVE' | 'OVERDUE' | 'UPCOMING' | 'TASKS') => void;
}

export const StaffStatsHeader: React.FC<StaffStatsHeaderProps> = ({
  activeCount,
  totalRooms,
  overdueCount,
  firstOverdueCustomer,
  upcomingCount,
  pendingTaskCount,
  activeFilter,
  onChangeFilter,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Khách Đang Dùng */}
      <div 
        onClick={() => onChangeFilter('ACTIVE')}
        className={`p-5 rounded-xl border flex justify-between items-center shadow-md cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
          activeFilter === 'ACTIVE'
            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-350'
            : 'bg-[var(--surface-color)] border-[var(--border-color)] hover:border-emerald-300'
        }`}
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--secondary-text)] font-bold m-0">
            Khách Đang Dùng
          </p>
          <h3 className="text-3xl font-bold text-[var(--primary-text)] mt-1 mb-0 font-serif">
            {activeCount}{' '}
            <span className="text-sm font-normal text-[var(--secondary-text)]">/ {totalRooms || 10} phòng</span>
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center font-bold shadow-sm transition ${
          activeFilter === 'ACTIVE' 
            ? 'bg-emerald-200 border-emerald-300 text-emerald-800' 
            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          <i className="fa-solid fa-users text-lg"></i>
        </div>
      </div>

      {/* Card 2: Quá Hạn Checkout (Cảnh báo đỏ sáng) */}
      <div 
        onClick={() => onChangeFilter('OVERDUE')}
        className={`p-5 rounded-xl border flex justify-between items-center shadow-md cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
          activeFilter === 'OVERDUE'
            ? 'bg-red-100 border-red-500 ring-2 ring-red-300'
            : 'bg-red-50 border-red-200 hover:border-red-400'
        }`}
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-red-750 font-bold m-0">
            Quá Hạn Checkout
          </p>
          <h3 className="text-3xl font-bold text-red-700 mt-1 mb-0 font-serif">
            {overdueCount}{' '}
            <span className="text-sm font-normal text-red-600">
              {firstOverdueCustomer ? `đơn (${firstOverdueCustomer})` : 'đơn'}
            </span>
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-sm transition ${
          activeFilter === 'OVERDUE' 
            ? 'bg-red-200 border-red-300 text-red-800 animate-bounce' 
            : 'bg-red-100 border-red-200 text-red-650 animate-pulse'
        }`}>
          <i className="fa-solid fa-clock-rotate-left text-lg"></i>
        </div>
      </div>

      {/* Card 3: Sắp Check-in (2h tới) */}
      <div 
        onClick={() => onChangeFilter('UPCOMING')}
        className={`p-5 rounded-xl border flex justify-between items-center shadow-md cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
          activeFilter === 'UPCOMING'
            ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300'
            : 'bg-[var(--surface-color)] border-[var(--border-color)] hover:border-amber-400'
        }`}
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--secondary-text)] font-bold m-0">
            Sắp Check-in (2h tới)
          </p>
          <h3 className="text-3xl font-bold text-amber-600 mt-1 mb-0 font-serif">
            {upcomingCount} <span className="text-sm font-normal text-[var(--secondary-text)]">đơn</span>
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-sm transition ${
          activeFilter === 'UPCOMING' 
            ? 'bg-amber-200 border-amber-300 text-amber-900' 
            : 'bg-amber-50 border-amber-100 text-amber-700'
        }`}>
          <i className="fa-solid fa-calendar-day text-lg"></i>
        </div>
      </div>

      {/* Card 4: Task Dọn Dẹp / Setup */}
      <div 
        onClick={() => onChangeFilter('TASKS')}
        className={`p-5 rounded-xl border flex justify-between items-center shadow-md cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
          activeFilter === 'TASKS'
            ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-300'
            : 'bg-[var(--surface-color)] border-[var(--border-color)] hover:border-amber-400'
        }`}
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--secondary-text)] font-bold m-0">
            Task Dọn Dẹp / Setup
          </p>
          <h3 className="text-3xl font-bold text-[var(--primary-text)] mt-1 mb-0 font-serif">
            {pendingTaskCount} <span className="text-sm font-normal text-[var(--secondary-text)]">cần làm</span>
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-sm transition ${
          activeFilter === 'TASKS' 
            ? 'bg-amber-100 border-amber-200 text-amber-850' 
            : 'bg-[var(--background-color)] border-stone-300 text-[var(--secondary-text)]'
        }`}>
          <i className="fa-solid fa-broom text-lg"></i>
        </div>
      </div>
    </div>
  );
};

export default StaffStatsHeader;
