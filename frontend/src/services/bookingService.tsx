import api from './api';
import type { Booking, CreateBookingRequest, ActiveBookingResponse } from '../types/booking.types';

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

  async requestCheckout(bookingId: number): Promise<any> {
    const response = await api.put<any>(`/bookings/${bookingId}/request-checkout`);
    return response.data;
  },

  async payFinal(bookingId: number): Promise<any> {
    const response = await api.put<any>(`/bookings/${bookingId}/pay-final`);
    return response.data;
  },

  async getCheckoutPreview(bookingId: number): Promise<any> {
    const response = await api.get<any>(`/bookings/${bookingId}/checkout-preview`);
    return response.data;
  },

  async deleteBooking(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`);
  },

  async getActiveBooking(): Promise<ActiveBookingResponse> {
    const response = await api.get<ActiveBookingResponse>('/bookings/active');
    return response.data;
  },

  async getAddOnServices(): Promise<any[]> {
    const response = await api.get<any[]>('/addon-services');
    return response.data;
  },

  async orderAddonService(bookingId: number, serviceId: number, quantity: number): Promise<any> {
    const response = await api.post<any>(`/bookings/${bookingId}/services`, { serviceId, quantity });
    return response.data;
  }
};
