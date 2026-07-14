import api from './api';
import type { Booking, CreateBookingRequest } from '../types/booking.types';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },

  async createBooking(booking: CreateBookingRequest): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', booking);
    return response.data;
  },

  async confirmPayment(id: number): Promise<void> {
    await api.put(`/bookings/${id}/pay`);
  },

  async requestCheckinCode(id: number): Promise<any> {
    const response = await api.put(`/bookings/${id}/request-checkin`);
    return response.data;
  },

  async checkinBooking(id: number, code: string): Promise<any> {
    const response = await api.put(`/bookings/${id}/checkin?code=${code}`);
    return response.data;
  },

  async getIncurredServices(bookingId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/bookings/${bookingId}/services`);
    return response.data;
  },

  async checkoutBooking(bookingId: number): Promise<any> {
    const response = await api.put<any>(`/bookings/${bookingId}/checkout`);
    return response.data;
  },

  async getBookingDetails(bookingId: number): Promise<any> {
    const response = await api.get<any>(`/bookings/${bookingId}/details`);
    return response.data;
  },

  async deleteBooking(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`);
  }
};
