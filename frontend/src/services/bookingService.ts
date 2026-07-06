import api from './api';
import type { Booking } from '../types/booking.types';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },

  async createBooking(booking: Omit<Booking, 'id' | 'userId'>): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', booking);
    return response.data;
  },

  async deleteBooking(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`);
  }
};
