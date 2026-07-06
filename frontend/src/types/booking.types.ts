export interface Booking {
  id: number;
  userId: number;
  title: string;
  description: string;
  bookingDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}
