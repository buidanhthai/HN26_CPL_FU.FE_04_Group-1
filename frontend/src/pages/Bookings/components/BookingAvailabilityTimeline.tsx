import React, { useState, useEffect } from 'react';
import { bookingService } from '../../../services/bookingService';
import type { Booking } from '../../../types/booking.types';

interface BookingAvailabilityTimelineProps {
  assetId: number;
  selectedDate: string;
  startTimeStr: string;
  endTimeStr: string;
  onSelectTime: (start: string, end: string) => void;
}

export const BookingAvailabilityTimeline: React.FC<BookingAvailabilityTimelineProps> = ({
  assetId,
  selectedDate,
  startTimeStr,
  endTimeStr,
  onSelectTime,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    bookingService.getBookings()
      .then((data) => setBookings(data || []))
      .catch((err) => console.error('Error fetching bookings:', err))
      .finally(() => setLoading(false));
  }, []);

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  // Helper to check if slot is booked
  const getBookingForSlot = (hour: number) => {
    if (!selectedDate) return null;
    const slotStart = new Date(`${selectedDate}T${String(hour).padStart(2, '0')}:00:00`);
    const slotEnd = new Date(`${selectedDate}T${String(hour + 1).padStart(2, '0')}:00:00`);

    return bookings.find((b) => {
      if (b.assetId !== assetId || b.bookingStatus === 'Cancelled') return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart < slotEnd && bEnd > slotStart;
    });
  };

  // Helper to check if slot is currently selected in form
  const isSlotSelected = (hour: number) => {
    if (!startTimeStr || !endTimeStr) return false;
    const startHour = parseInt(startTimeStr.split(':')[0], 10);
    const endHour = parseInt(endTimeStr.split(':')[0], 10);
    return hour >= startHour && hour < endHour;
  };

  if (!selectedDate) {
    return (
      <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', textAlign: 'center', padding: '12px' }}>
        ⚠️ Vui lòng chọn ngày để xem lịch trống của phòng.
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      backgroundColor: 'rgba(255,255,255,0.01)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: '0', fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
          🕒 Lịch trống của phòng ({selectedDate.split('-').reverse().join('/')})
        </h4>
        {loading && <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Đang tải...</span>}
      </div>

      {/* Grid of hour slots */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '8px',
        maxHeight: '180px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {hours.map((h) => {
          const booking = getBookingForSlot(h);
          const isBooked = !!booking;
          const isSelected = isSlotSelected(h);

          let bg = 'rgba(122, 134, 106, 0.08)'; // Empty: sage green light
          let color = 'var(--nature-accent)';
          let border = '1px solid rgba(122, 134, 106, 0.2)';
          let label = 'Trống';
          let cursor = 'pointer';

          if (isBooked) {
            bg = 'rgba(111, 78, 55, 0.05)'; // Booked: light brown/gray
            color = 'var(--secondary-text)';
            border = '1px solid rgba(111, 78, 55, 0.15)';
            label = '🔒 Đã đặt';
            cursor = 'not-allowed';
          } else if (isSelected) {
            bg = 'var(--accent-color)'; // Selected: accent orange-yellow
            color = '#fff';
            border = '1px solid var(--accent-color)';
            label = 'Đang chọn';
          }

          const slotStartStr = `${String(h).padStart(2, '0')}:00`;
          const slotEndStr = `${String(h + 1).padStart(2, '0')}:00`;

          return (
            <div
              key={h}
              onClick={() => {
                if (!isBooked) {
                  onSelectTime(slotStartStr, slotEndStr);
                }
              }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: bg,
                color: color,
                border: border,
                textAlign: 'center',
                cursor: cursor,
                fontSize: '0.75rem',
                fontWeight: '600',
                transition: 'var(--transition)',
                opacity: isBooked ? 0.6 : 1,
              }}
              title={isBooked ? 'Khung giờ này đã được đặt trước.' : `Chọn khung giờ ${slotStartStr} - ${slotEndStr}`}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '2px' }}>
                {slotStartStr} - {slotEndStr}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 'normal', opacity: 0.8 }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Legend */}
      <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', color: 'var(--secondary-text)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(122, 134, 106, 0.12)', borderRadius: '2px', border: '1px solid rgba(122, 134, 106, 0.2)' }}></div>
          <span>Trống (Có thể chọn)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-color)', borderRadius: '2px' }}></div>
          <span>Đang chọn</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(111, 78, 55, 0.05)', borderRadius: '2px', border: '1px solid rgba(111, 78, 55, 0.15)' }}></div>
          <span>Đã bận</span>
        </div>
      </div>
    </div>
  );
};
