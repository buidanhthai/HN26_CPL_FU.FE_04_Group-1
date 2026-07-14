export interface Booking {
  id: number;
  userId: number;
  assetId: number;
  layoutId: number;
  startTime: string;
  endTime: string;
  bookingStatus: 'Pending' | 'Awaiting_Payment' | 'Confirmed' | 'Checked_In' | 'Checked_Out' | 'Cancelled';
  paymentDeadline?: string;
  customSetupNote?: string;
  snapshotBasePrice: number;
  snapshotPriceModifier: number;
  createdAt: string;
  checkInVerificationCode?: string;
}

export interface CreateBookingRequest {
  userId: number;
  assetId: number;
  layoutId: number;
  startTime: string;
  endTime: string;
  customSetupNote?: string;
  snapshotBasePrice: number;
  snapshotPriceModifier: number;
}
