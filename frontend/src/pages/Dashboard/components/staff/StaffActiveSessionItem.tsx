import React from 'react';
import type { ActiveSessionDetailed } from '../../hooks/useStaffDashboardData';
import api from '../../../../services/api';

interface StaffActiveSessionItemProps {
  booking: ActiveSessionDetailed;
  spaceAssets: any[];
  onRefresh: () => void;
  onOpenAddService: (bookingId: number) => void;
  onCheckout: (bookingId: number) => void;
  onOpenExtend: (bookingId: number) => void;
  onOpenSwitch: (bookingId: number, currentAssetId: number) => void;
}

const formatTime = (isoStr: string) => {
  try {
    return new Date(isoStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const StaffActiveSessionItem: React.FC<StaffActiveSessionItemProps> = ({
  booking,
  spaceAssets,
  onRefresh,
  onOpenAddService,
  onCheckout,
  onOpenExtend,
  onOpenSwitch,
}) => {
  const getAssetName = (assetId: number) => {
    const asset = spaceAssets.find((a) => a.id === assetId);
    return asset ? asset.assetName : `Không gian #${assetId}`;
  };

  const isOverdue = booking.isOverdue ?? false;
  const overdueMinutes = booking.overdueMinutes ?? 10;
  const overtimeFee = booking.overtimeFee || 25000;

  const now = new Date();
  const endTime = new Date(booking.endTime);
  const remainingMins = Math.max(0, Math.ceil((endTime.getTime() - now.getTime()) / 60000));
  const remHours = Math.floor(remainingMins / 60);
  const remMins = remainingMins % 60;

  const borderClass = isOverdue
    ? 'border-l-4 border-l-red-500'
    : 'border-l-4 border-l-emerald-500';

  const hasIncurred = booking.services?.some((s) => s.isIncurred);

  return (
    <div
      className={`bg-[#2b201c] rounded-xl p-5 border border-[#3d2e29] space-y-4 ${borderClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-lg font-bold text-white">
              Khách hàng: {booking.customerFullName || booking.customerName || `Khách #${booking.userId}`} (Booking #{booking.id})
            </h4>
            {isOverdue ? (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#4a1919] text-[#ff8080] border border-[#7a2828] animate-pulse">
                ⚠️ Quá hạn {overdueMinutes} phút
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#1c3b2b] text-[#6ee7b7] border border-[#28573f]">
                {booking.bookingStatus === 'Awaiting_Checkout' ? 'Chờ Checkout' : 'Đang sử dụng'}
              </span>
            )}
            {booking.cleaningStatus && (
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                booking.cleaningStatus === 'Completed'
                  ? 'bg-[#1c3b2b] text-[#6ee7b7] border-[#28573f]'
                  : booking.cleaningStatus === 'In_Progress'
                  ? 'bg-[#3b2b1c] text-[#fcd34d] border-[#573f28]'
                  : 'bg-[#4a1919] text-[#ff8080] border-[#7a2828]'
              }`}>
                {booking.cleaningStatus === 'Completed' ? '✨ Sạch' : booking.cleaningStatus === 'In_Progress' ? '🧹 Đang dọn' : '🧹 Cần dọn'}
              </span>
            )}
          </div>
          <p className="text-stone-400 text-sm mt-0.5">
            Vị trí: <strong>{getAssetName(booking.assetId)}</strong> • Loại: {booking.assetId === 2 ? 'Gói Theo Giờ' : 'Linh hoạt'}
          </p>
        </div>
        <span className="text-xs text-stone-400 bg-stone-900 px-3 py-1 rounded-lg border border-stone-800">
          {formatTime(booking.startTime)} - {formatTime(booking.endTime)} (Hôm nay)
        </span>
      </div>

      {/* Services Included & Incurred Box */}
      <div className="bg-[#201815] p-3 rounded-lg text-xs space-y-1.5 border border-stone-800">
        <div className="text-stone-400 font-medium">
          {hasIncurred ? 'Dịch vụ đính kèm & Phát sinh:' : 'Dịch vụ đính kèm:'}
        </div>
        {!booking.services || booking.services.length === 0 ? (
          <div className="flex justify-between text-stone-300">
            <span>• {booking.assetId === 2 ? 'Trà đá & Cà phê (x3)' : 'Trà sữa Matcha (x2)'}</span>
            <span className="text-emerald-400">Đã thanh toán</span>
          </div>
        ) : (
          booking.services.map((sd, idx) => (
            <div key={idx} className="flex justify-between text-stone-300">
              <span>• {sd.serviceName} (x{sd.quantity})</span>
              {sd.paymentStatus === 'Paid' ? (
                <span className="text-emerald-400 font-medium">Đã thanh toán</span>
              ) : (
                <span className="text-amber-400 font-semibold">Chưa thanh toán (Phát sinh)</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Buttons for Staff */}
      <div className="flex justify-between items-center pt-2 border-t border-stone-800 flex-wrap gap-2">
        <div className="text-xs font-medium">
          {isOverdue ? (
            <span className="text-red-400 font-medium">
              Phạt Overtime (1.5x): <strong>+{formatCurrency(overtimeFee)}</strong>
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">
              Còn lại: <strong>{remHours > 0 ? `${remHours} giờ ${remMins} phút` : `${remMins} phút`}</strong>
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onOpenAddService(booking.id)}
            className="px-3 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition border border-stone-700 cursor-pointer"
          >
            + Dịch vụ
          </button>
          <button
            onClick={() => onOpenExtend(booking.id)}
            className="px-3 py-1.5 text-xs bg-amber-800 hover:bg-amber-700 text-stone-200 rounded-lg transition border border-[#5c3e1e] cursor-pointer"
          >
            ⏰ Gia hạn
          </button>
          <button
            onClick={() => onOpenSwitch(booking.id, booking.assetId)}
            className="px-3 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition border border-stone-700 cursor-pointer"
          >
            🔄 Đổi phòng
          </button>
          <button
            onClick={async () => {
              if (window.confirm(`Bạn có chắc muốn cưỡng chế checkout Booking #${booking.id}? Tiền phạt Overtime 1.5x và nợ dịch vụ phát sinh sẽ được ghi nhận vào hóa đơn.`)) {
                try {
                  await api.post(`/bookings/${booking.id}/force-checkout`);
                  alert('Cưỡng chế checkout thành công! Phòng đã được giải phóng.');
                  onRefresh();
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Lỗi khi cưỡng chế checkout');
                }
              }
            }}
            className="px-3 py-1.5 text-xs bg-[#5a1c1c] hover:bg-[#7a2828] text-red-200 rounded-lg transition border border-[#7a2828] cursor-pointer font-bold"
          >
            🚨 Cưỡng chế Checkout
          </button>
          <button
            onClick={() => onCheckout(booking.id)}
            className={`px-4 py-1.5 text-xs text-white font-medium rounded-lg transition shadow-lg cursor-pointer ${
              isOverdue
                ? 'bg-red-600 hover:bg-red-500 shadow-red-950'
                : 'bg-amber-700 hover:bg-amber-600'
            }`}
          >
            {isOverdue ? 'Checkout & Quyết toán' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};
