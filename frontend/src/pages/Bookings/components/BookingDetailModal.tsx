import React from 'react';
import type { Booking } from '../../../types/booking.types';
import { bookingService } from '../../../services/bookingService';
import { formatToVNTime } from '../../../utils/dateFormatter';
import { BookingRoomInfo } from './BookingRoomInfo';
import { BookingCustomerInfo } from './BookingCustomerInfo';
import { BookingServicesTable } from './BookingServicesTable';
import { ItemizedInvoiceTable } from './ItemizedInvoiceTable';

interface BookingDetailModalProps {
  details: {
    booking: Booking;
    spaceAsset?: {
      assetName: string;
      locationName: string;
      capacity: number;
      dimensions: string;
      areaM2: number;
      assetType: string;
    };
    roomLayout?: {
      layoutName: string;
      setupDurationMinutes: number;
    };
    user?: { fullName: string; email: string };
    services: any[];
    logs: any[];
    invoices: any[];
  } | null;
  onClose: () => void;
  spaceAssets: any[];
  onRefresh?: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  details,
  onClose,
  spaceAssets,
  onRefresh
}) => {
  const [localDetails, setLocalDetails] = React.useState<any>(details);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    setLocalDetails(details);
  }, [details]);

  if (!localDetails) return null;

  const { booking, user, services, logs, spaceAsset: apiSpaceAsset, roomLayout, invoiceDetail } = localDetails;

  const dbSpaceAsset = spaceAssets.find(a => a.id === booking.assetId || a.Id === booking.assetId);
  const locationName = apiSpaceAsset?.locationName ?? dbSpaceAsset?.locationName ?? dbSpaceAsset?.LocationName ?? 'N/A';
  const dimensions = apiSpaceAsset?.dimensions ?? dbSpaceAsset?.dimensions ?? dbSpaceAsset?.Dimensions ?? 'N/A';
  const areaM2 = apiSpaceAsset?.areaM2 ?? dbSpaceAsset?.areaM2 ?? dbSpaceAsset?.AreaM2 ?? 0;
  const capacity = apiSpaceAsset?.capacity ?? dbSpaceAsset?.capacity ?? dbSpaceAsset?.Capacity ?? 0;
  const layoutName = roomLayout?.layoutName ?? (booking.layoutId === 1 ? 'Chữ U' : 'Lớp học');

  const isRoomPaid = booking.bookingStatus !== 'Awaiting_Payment' && booking.bookingStatus !== 'Cancelled';

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  let fallbackHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  fallbackHours = Math.round(fallbackHours * 2) / 2;
  if (fallbackHours <= 0) fallbackHours = 0.5;

  const handleConfirmPayment = async () => {
    const finalDueAmount = invoiceDetail ? invoiceDetail.finalDue : 0;
    const confirmMsg = `Bạn có chắc chắn muốn xác nhận đã thu thêm ${finalDueAmount.toLocaleString()}đ từ khách hàng cho các dịch vụ phát sinh?`;
    if (window.confirm(confirmMsg)) {
      try {
        setIsProcessing(true);
        await bookingService.payFinal(booking.id);
        alert('Xác nhận thanh toán dịch vụ phát sinh thành công!');
        const updatedDetails = await bookingService.getBookingDetails(booking.id);
        setLocalDetails(updatedDetails);
        if (onRefresh) {
          onRefresh();
        }
      } catch (e: any) {
        alert(e.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '650px' }}>
        <h3 className="modal-title">
          CHI TIẾT ĐƠN ĐẶT PHÒNG: {booking.bookingCode}
        </h3>

        <BookingRoomInfo
          booking={booking}
          apiSpaceAsset={apiSpaceAsset}
          dbSpaceAsset={dbSpaceAsset}
          locationName={locationName}
          dimensions={dimensions}
          areaM2={areaM2}
          capacity={capacity}
          layoutName={layoutName}
          formatToVNTime={formatToVNTime}
        />

        <BookingCustomerInfo booking={booking} user={user} />
        
        <BookingServicesTable services={services} />

        <ItemizedInvoiceTable
          invoiceDetail={invoiceDetail}
          booking={booking}
          apiSpaceAsset={apiSpaceAsset}
          dbSpaceAsset={dbSpaceAsset}
          isRoomPaid={isRoomPaid}
          layoutName={layoutName}
          fallbackHours={fallbackHours}
          services={services}
          formatToVNTime={formatToVNTime}
        />

        {/* Audit Logs */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            Lịch sử thao tác trên hệ thống
          </h4>
          {logs.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0', fontStyle: 'italic' }}>Chưa có thao tác nào ghi lại.</p>
          ) : (
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              {logs.map((log: any, idx: number) => (
                <div key={idx} style={{
                  padding: '8px 12px',
                  borderBottom: idx < logs.length - 1 ? '1px solid var(--border-color)' : 'none',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{log.userFullName}</span>: {log.actionDescription}
                  </div>
                  <div style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatToVNTime(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close/Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          {(invoiceDetail ? invoiceDetail.finalDue > 0 : false) && (
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="btn btn-success"
              style={{
                padding: '8px 24px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                backgroundColor: 'var(--nature-accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                opacity: isProcessing ? 0.7 : 1
              }}
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="btn btn-primary"
            style={{ padding: '8px 24px', borderRadius: '6px', fontSize: '0.9rem' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
