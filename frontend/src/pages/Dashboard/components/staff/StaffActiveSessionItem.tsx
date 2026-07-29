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
      className={`bg-[var(--surface-color)] rounded-xl p-5 border border-[var(--border-color)] space-y-4 ${borderClass}`}
      style={{ boxShadow: 'var(--shadow)' }}
    >
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-lg font-bold text-[var(--primary-text)] m-0">
              Khách hàng: {booking.customerFullName || booking.customerName || `Khách #${booking.userId}`} (Booking #{booking.id})
            </h4>
            {isOverdue ? (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">
                ⚠️ Quá hạn {overdueMinutes} phút
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {booking.bookingStatus === 'Awaiting_Checkout' ? 'Chờ Checkout' : 'Đang sử dụng'}
              </span>
            )}
            {booking.cleaningStatus && (
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                booking.cleaningStatus === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : booking.cleaningStatus === 'In_Progress'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {booking.cleaningStatus === 'Completed' ? '✨ Sạch' : booking.cleaningStatus === 'In_Progress' ? '🧹 Đang dọn' : '🧹 Cần dọn'}
              </span>
            )}
          </div>
          <p className="text-[var(--secondary-text)] text-sm mt-1 mb-0">
            Vị trí: <strong className="text-[var(--primary-text)]">{getAssetName(booking.assetId)}</strong> • Loại: {booking.assetId === 2 ? 'Gói Theo Giờ' : 'Linh hoạt'}
          </p>
        </div>
        <span className="text-xs text-[var(--secondary-text)] bg-[var(--background-color)] px-3 py-1 rounded-lg border border-[var(--border-color)] font-medium">
          {formatTime(booking.startTime)} - {formatTime(booking.endTime)} (Hôm nay)
        </span>
      </div>

      {/* Services Included & Incurred Box */}
      <div className="bg-[var(--background-color)] p-3 rounded-lg text-xs space-y-1.5 border border-[var(--border-color)]">
        <div className="text-[var(--secondary-text)] font-semibold mb-1">
          {hasIncurred ? 'Dịch vụ đính kèm & Phát sinh:' : 'Dịch vụ đính kèm:'}
        </div>
        {!booking.services || booking.services.length === 0 ? (
          <div className="flex justify-between text-[var(--primary-text)] font-medium">
            <span>• {booking.assetId === 2 ? 'Trà đá & Cà phê (x3)' : 'Trà sữa Matcha (x2)'}</span>
            <span className="text-emerald-700">Đã thanh toán</span>
          </div>
        ) : (
          booking.services.map((sd, idx) => (
            <div key={idx} className="flex justify-between text-[var(--primary-text)] font-medium">
              <span>• {sd.serviceName} (x{sd.quantity})</span>
              {sd.paymentStatus === 'Paid' ? (
                <span className="text-emerald-700 font-semibold">Đã thanh toán</span>
              ) : (
                <span className="text-amber-700 font-semibold">Chưa thanh toán (Phát sinh)</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Buttons for Staff */}
      <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] flex-wrap gap-2">
        <div className="text-xs font-semibold">
          {isOverdue ? (
            <span className="text-red-600 font-semibold">
              Phạt Overtime (1.5x): <strong>+{formatCurrency(overtimeFee)}</strong>
            </span>
          ) : (
            <span className="text-emerald-700 font-semibold">
              Còn lại: <strong>{remHours > 0 ? `${remHours} giờ ${remMins} phút` : `${remMins} phút`}</strong>
            </span>
          )}
        </div>
        <div className="flex space-x-3 flex-wrap gap-y-2">
          <button
            onClick={() => onOpenAddService(booking.id)}
            className="px-3 py-1.5 text-xs bg-[var(--surface-color)] hover:bg-[var(--border-color)] text-[var(--primary-text)] rounded-lg transition border border-[var(--border-color)] cursor-pointer font-semibold"
          >
            + Dịch vụ
          </button>
          <button
            onClick={() => onOpenExtend(booking.id)}
            className="px-3 py-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition border border-amber-300 cursor-pointer font-semibold"
          >
            ⏰ Gia hạn
          </button>
          <button
            onClick={() => onOpenSwitch(booking.id, booking.assetId)}
            className="px-3 py-1.5 text-xs bg-[var(--surface-color)] hover:bg-[var(--border-color)] text-[var(--primary-text)] rounded-lg transition border border-[var(--border-color)] cursor-pointer font-semibold"
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
            className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition border border-red-200 cursor-pointer font-bold"
          >
            🚨 Cưỡng chế Checkout
          </button>
          <button
            onClick={() => onCheckout(booking.id)}
            className={`px-4 py-1.5 text-xs text-white font-semibold rounded-lg transition shadow-md cursor-pointer ${
              isOverdue
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {isOverdue ? 'Checkout & Quyết toán' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};
