import React from 'react';
import type { ActiveSessionDetailed } from '../../hooks/useStaffDashboardData';
import { StaffActiveSessionItem } from './StaffActiveSessionItem';

interface StaffActiveSessionsListProps {
  activeSessions: ActiveSessionDetailed[];
  spaceAssets: any[];
  onRefresh: () => void;
  onOpenAddService: (bookingId: number) => void;
  onCheckout: (bookingId: number) => void;
  onOpenExtend: (bookingId: number) => void;
  onOpenSwitch: (bookingId: number, currentAssetId: number) => void;
}

export const StaffActiveSessionsList: React.FC<StaffActiveSessionsListProps> = ({
  activeSessions,
  spaceAssets,
  onRefresh,
  onOpenAddService,
  onCheckout,
  onOpenExtend,
  onOpenSwitch,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif text-[var(--primary-text)] flex items-center gap-2">
          <span>🟢 Phiên Đặt Chỗ Đang Hoạt Động</span>
          <span className="text-xs font-sans bg-[var(--surface-color)] text-[var(--secondary-text)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)]">
            Real-time
          </span>
        </h3>
        <button
          onClick={onRefresh}
          className="text-xs text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          Tải lại danh sách
        </button>
      </div>

      {activeSessions.length === 0 ? (
        <div className="bg-[#2b201c] rounded-xl p-8 text-center text-stone-400 border border-[#3d2e29]">
          <i className="fa-solid fa-mug-hot text-3xl text-stone-600 mb-2"></i>
          <p>Hiện không có phiên đặt chỗ nào đang diễn ra.</p>
        </div>
      ) : (
        activeSessions.map((booking) => (
          <StaffActiveSessionItem
            key={booking.id}
            booking={booking}
            spaceAssets={spaceAssets}
            onRefresh={onRefresh}
            onOpenAddService={onOpenAddService}
            onCheckout={onCheckout}
            onOpenExtend={onOpenExtend}
            onOpenSwitch={onOpenSwitch}
          />
        ))
      )}
    </div>
  );
};

export default StaffActiveSessionsList;
