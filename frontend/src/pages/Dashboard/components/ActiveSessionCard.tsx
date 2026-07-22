import React from 'react';
import { bookingService } from '../../../services/bookingService';
import type { ActiveBookingResponse } from '../../../types/booking.types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface ActiveSessionCardProps {
  activeBooking: ActiveBookingResponse;
  formatCurrency: (val: number) => string;
  onRefresh: () => void;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  activeBooking,
  formatCurrency,
  onRefresh,
}) => {
  const [isOverdue, setIsOverdue] = React.useState<boolean>(activeBooking.isOverdue || false);
  const [overdueMinutes, setOverdueMinutes] = React.useState<number>(activeBooking.overdueMinutes || 0);

  React.useEffect(() => {
    const checkOverdueStatus = () => {
      if (activeBooking.booking.bookingStatus === 'Checked_In') {
        const endTimeTz = dayjs(activeBooking.booking.endTime).tz('Asia/Ho_Chi_Minh');
        const nowTz = dayjs().tz('Asia/Ho_Chi_Minh');
        if (nowTz.isAfter(endTimeTz)) {
          const diffMins = Math.floor(nowTz.diff(endTimeTz, 'minute', true));
          setIsOverdue(true);
          setOverdueMinutes(diffMins);
        } else {
          setIsOverdue(false);
          setOverdueMinutes(0);
        }
      } else {
        setIsOverdue(false);
        setOverdueMinutes(0);
      }
    };

    checkOverdueStatus();
    // Check every 10 seconds for real-time updates
    const intervalId = setInterval(checkOverdueStatus, 10000);
    return () => clearInterval(intervalId);
  }, [activeBooking.booking.endTime, activeBooking.booking.bookingStatus]);

  const getStatusBadgeInfo = () => {
    const status = activeBooking.booking.bookingStatus;
    const startTimeTz = dayjs(activeBooking.booking.startTime).tz('Asia/Ho_Chi_Minh');
    const nowTz = dayjs().tz('Asia/Ho_Chi_Minh');

    if (status === 'Awaiting_Payment') {
      return {
        text: 'Chờ thanh toán',
        bgColor: '#D9534F',
        color: '#fff',
        animation: 'none',
        leftBarColor: '#D9534F'
      };
    }
    
    if (status === 'Confirmed') {
      if (nowTz.isBefore(startTimeTz)) {
        return {
          text: 'Sắp diễn ra',
          bgColor: '#0275d8',
          color: '#fff',
          animation: 'none',
          leftBarColor: '#0275d8'
        };
      } else {
        return {
          text: 'Chờ Check-in',
          bgColor: '#f0ad4e',
          color: '#fff',
          animation: 'pulse-warning 2s infinite',
          leftBarColor: '#f0ad4e'
        };
      }
    }

    if (status === 'Checked_In') {
      if (isOverdue) {
        return {
          text: `⚠️ Quá hạn ${overdueMinutes} phút`,
          bgColor: '#e07a5f',
          color: '#fff',
          animation: 'pulse-danger 2s infinite',
          leftBarColor: '#e07a5f'
        };
      } else {
        return {
          text: 'Đang hoạt động',
          bgColor: 'var(--nature-accent)',
          color: '#fff',
          animation: 'pulse 2s infinite',
          leftBarColor: 'var(--nature-accent)'
        };
      }
    }

    if (status === 'Awaiting_Checkout') {
      return {
        text: 'Chờ Checkout',
        bgColor: '#5bc0de',
        color: '#fff',
        animation: 'none',
        leftBarColor: '#5bc0de'
      };
    }

    return {
      text: status,
      bgColor: 'var(--secondary-text)',
      color: '#fff',
      animation: 'none',
      leftBarColor: 'var(--border-color)'
    };
  };

  const badgeInfo = getStatusBadgeInfo();

  return (
    <div
      style={{
        backgroundColor: isOverdue ? 'rgba(224, 122, 95, 0.08)' : 'var(--surface-color)',
        padding: '24px',
        borderRadius: '16px',
        border: isOverdue ? '1.5px solid #e07a5f' : '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '100%',
          backgroundColor: badgeInfo.leftBarColor,
          transition: 'background-color 0.3s ease',
        }}
      />
 
      {/* Header: status badge + booking id + check-in code */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              backgroundColor: badgeInfo.bgColor,
              color: badgeInfo.color,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              padding: '4px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              animation: badgeInfo.animation,
            }}
          >
            {badgeInfo.text}
          </span>
          <span
            style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', fontWeight: 'bold' }}
          >
            Mã booking: {activeBooking.booking.bookingCode}
          </span>
        </div>
      </div>

      {/* Room info */}
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '1.5rem',
          color: 'var(--primary-text)',
          fontFamily: 'var(--font-title)',
        }}
      >
        🏢 {activeBooking.spaceAsset.assetName}
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '0.9rem',
          color: 'var(--secondary-text)',
          marginBottom: '16px',
        }}
      >
        <div>📍 <strong>Vị trí:</strong> {activeBooking.spaceAsset.locationName}</div>
        <div>📐 <strong>Kích thước:</strong> {activeBooking.spaceAsset.dimensions} ({activeBooking.spaceAsset.areaM2} m²)</div>
        <div>👥 <strong>Sức chứa tối đa:</strong> {activeBooking.spaceAsset.capacity} người</div>
        <div>🛋️ <strong>Sơ đồ bày trí:</strong> {activeBooking.roomLayout.layoutName}</div>
      </div>

      {/* Time range */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          color: 'var(--primary-text)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          🕒 <strong>Bắt đầu:</strong>{' '}
          {new Date(activeBooking.booking.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          ({new Date(activeBooking.booking.startTime).toLocaleDateString()})
        </div>
        <div style={{ color: isOverdue ? '#e07a5f' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
          🕒 <strong>Kết thúc:</strong>{' '}
          {new Date(activeBooking.booking.endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          ({new Date(activeBooking.booking.endTime).toLocaleDateString()})
        </div>
      </div>

      {/* Checkout Actions Panel */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          marginTop: '16px',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {activeBooking.booking.bookingStatus === 'Checked_In' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
              {isOverdue 
                ? 'Đã vượt quá thời gian sử dụng phòng. Vui lòng thực hiện checkout.'
                : 'Bạn có thể gửi yêu cầu checkout khi kết thúc buổi làm việc.'}
            </span>
            <button
              onClick={async () => {
                if (window.confirm('Bạn có chắc chắn muốn gửi yêu cầu Checkout phòng?')) {
                  try {
                    await bookingService.requestCheckout(activeBooking.booking.id);
                    alert('Gửi yêu cầu Checkout thành công!');
                    onRefresh();
                  } catch (e: any) {
                    alert(e.response?.data?.message || 'Lỗi khi yêu cầu Checkout');
                  }
                }
              }}
              className="btn btn-danger hover-lift"
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              {isOverdue ? '🔔 Xác nhận trả phòng (Quá hạn)' : '🔔 Yêu cầu Checkout'}
            </button>
          </div>
        )}

        {activeBooking.booking.bookingStatus === 'Awaiting_Checkout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                backgroundColor: 'rgba(212, 163, 115, 0.12)',
                border: '1px solid var(--accent-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                color: 'var(--primary-text)',
              }}
            >
              📌 <strong>Trạng thái: Chờ Checkout.</strong>
              {activeBooking.incurredUnpaidTotal > 0 ? (
                <span>
                  {' '}Vui lòng thực hiện thanh toán hóa đơn cuối cho các dịch vụ phát sinh để
                  nhân viên xác nhận Checkout.
                </span>
              ) : (
                <span>
                  {' '}Bạn đã hoàn tất các khoản thanh toán. Vui lòng chờ nhân viên kiểm tra và
                  xác nhận Checkout để giải phóng phòng.
                </span>
              )}
            </div>

            {activeBooking.incurredUnpaidTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={async () => {
                    try {
                      await bookingService.payFinal(activeBooking.booking.id);
                      alert('Thanh toán hóa đơn cuối (Giả lập) thành công!');
                      onRefresh();
                    } catch (e: any) {
                      alert(e.response?.data?.message || 'Lỗi khi thanh toán');
                    }
                  }}
                  className="btn btn-primary hover-lift"
                  style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  💳 Thanh toán cuối ({formatCurrency(activeBooking.incurredUnpaidTotal)})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(122, 134, 106, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(122, 134, 106, 0); }
          100% { box-shadow: 0 0 0 0 rgba(122, 134, 106, 0); }
        }
        @keyframes pulse-danger {
          0% { box-shadow: 0 0 0 0 rgba(224, 122, 95, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(224, 122, 95, 0); }
          100% { box-shadow: 0 0 0 0 rgba(224, 122, 95, 0); }
        }
        @keyframes pulse-warning {
          0% { box-shadow: 0 0 0 0 rgba(240, 173, 78, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(240, 173, 78, 0); }
          100% { box-shadow: 0 0 0 0 rgba(240, 173, 78, 0); }
        }
      `}</style>
    </div>
  );
};

export default ActiveSessionCard;
