import { useState, useEffect } from 'react';
import { bookingService } from '../../../services/bookingService';
import type { ActiveBookingResponse } from '../../../types/booking.types';

export function useActiveBooking(userRole?: string) {
  const [activeBooking, setActiveBooking] = useState<ActiveBookingResponse | null>(null);
  const [addonServices, setAddonServices] = useState<any[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);

  const fetchActiveBooking = async () => {
    try {
      setLoadingActive(true);
      const data = await bookingService.getActiveBooking();
      setActiveBooking(data);
    } catch (err: any) {
      console.error('Error fetching active booking:', err);
      setActiveBooking(null);
    } finally {
      setLoadingActive(false);
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

  useEffect(() => {
    if (userRole === 'USER') {
      fetchActiveBooking();
      fetchAddonServices();

      // Refresh every 15 seconds to sync incurred services / bill
      const interval = setInterval(() => {
        fetchActiveBooking();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [userRole]);

  return {
    activeBooking,
    setActiveBooking,
    addonServices,
    loadingActive,
    fetchActiveBooking,
  };
}
