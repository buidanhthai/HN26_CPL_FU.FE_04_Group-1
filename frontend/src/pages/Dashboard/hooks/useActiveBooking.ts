import { useState, useEffect } from 'react';
import { bookingService } from '../../../services/bookingService';
import type { ActiveBookingResponse, Booking } from '../../../types/booking.types';

export function useActiveBooking(userRole?: string) {
  const [activeBooking, setActiveBooking] = useState<ActiveBookingResponse | null>(null);
  const [addonServices, setAddonServices] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [allUserBookings, setAllUserBookings] = useState<Booking[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);

  const fetchActiveBooking = async (bookingId?: number) => {
    try {
      setLoadingActive(true);
      const data = await bookingService.getActiveBooking(bookingId);
      setActiveBooking(data);
    } catch (err: any) {
      console.error('Error fetching active booking:', err);
      setActiveBooking(null);
    } finally {
      setLoadingActive(false);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      const now = new Date();
      // Lọc các booking trong tương lai (StartTime > hiện tại) và chưa bị Hủy
      const filtered = data.filter((b: Booking) => 
        (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Awaiting_Payment') &&
        new Date(b.startTime) > now
      );
      setUpcomingBookings(filtered);

      // Lưu lại tất cả booking chưa kết thúc
      const activeOrUpcoming = data.filter((b: Booking) =>
        b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Checked_Out'
      );
      setAllUserBookings(activeOrUpcoming);
    } catch (err) {
      console.error('Error fetching upcoming bookings:', err);
      setUpcomingBookings([]);
      setAllUserBookings([]);
    }
  };

  const fetchAddonServices = async () => {
    try {
      const data = await bookingService.getAddOnServices();
      setAddonServices(data);
    } catch (err) {
      console.error('Error fetching addon services:', err);
    }
  };

  const refreshData = async (bookingId?: number) => {
    await Promise.all([
      fetchActiveBooking(bookingId),
      fetchUpcomingBookings(),
      fetchAddonServices()
    ]);
  };

  useEffect(() => {
    if (userRole === 'USER') {
      refreshData();

      // Refresh every 15 seconds to sync incurred services / bill & upcoming list
      const interval = setInterval(() => {
        fetchUpcomingBookings();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [userRole]);

  return {
    activeBooking,
    setActiveBooking,
    addonServices,
    upcomingBookings,
    allUserBookings,
    loadingActive,
    fetchActiveBooking,
    refreshData
  };
}
