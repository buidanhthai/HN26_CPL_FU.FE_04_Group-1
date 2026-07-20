import React from 'react';

interface StaffStatsHeaderProps {
  activeCount: number;
  totalRooms: number;
  overdueCount: number;
  firstOverdueCustomer?: string;
  upcomingCount: number;
  pendingTaskCount: number;
}

export const StaffStatsHeader: React.FC<StaffStatsHeaderProps> = ({
  activeCount,
  totalRooms,
  overdueCount,
  firstOverdueCustomer,
  upcomingCount,
  pendingTaskCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Khách Đang Dùng */}
      <div className="bg-[#2b201c] p-5 rounded-xl border border-[#3d2e29] flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
            Khách Đang Dùng
          </p>
          <h3 className="text-3xl font-bold text-white mt-1">
            {activeCount}{' '}
            <span className="text-sm font-normal text-stone-400">/ {totalRooms || 10} phòng</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
          <i className="fa-solid fa-users text-xl"></i>
        </div>
      </div>

      {/* Card 2: Quá Hạn Checkout (Cảnh báo đỏ) */}
      <div className="bg-[#2b201c] p-5 rounded-xl border border-red-900/50 bg-red-950/10 flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs uppercase tracking-wider text-red-400 font-semibold">
            Quá Hạn Checkout
          </p>
          <h3 className="text-3xl font-bold text-red-500 mt-1">
            {overdueCount}{' '}
            <span className="text-sm font-normal text-red-300">
              {firstOverdueCustomer ? `đơn (${firstOverdueCustomer})` : 'đơn'}
            </span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-400 animate-pulse">
          <i className="fa-solid fa-clock-rotate-left text-xl"></i>
        </div>
      </div>

      {/* Card 3: Sắp Check-in (2h tới) */}
      <div className="bg-[#2b201c] p-5 rounded-xl border border-[#3d2e29] flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
            Sắp Check-in (2h tới)
          </p>
          <h3 className="text-3xl font-bold text-amber-500 mt-1">
            {upcomingCount} <span className="text-sm font-normal text-stone-400">đơn</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
          <i className="fa-solid fa-calendar-day text-xl"></i>
        </div>
      </div>

      {/* Card 4: Task Dọn Dẹp / Setup */}
      <div className="bg-[#2b201c] p-5 rounded-xl border border-[#3d2e29] flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
            Task Dọn Dẹp / Setup
          </p>
          <h3 className="text-3xl font-bold text-white mt-1">
            {pendingTaskCount} <span className="text-sm font-normal text-stone-400">cần làm</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
          <i className="fa-solid fa-broom text-xl"></i>
        </div>
      </div>
    </div>
  );
};

export default StaffStatsHeader;
