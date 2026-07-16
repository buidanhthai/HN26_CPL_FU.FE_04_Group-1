export interface Booking {
  id: number;
  userId: number;
  assetId: number;
  layoutId: number;
  startTime: string;
  endTime: string;
  bookingStatus: 'Pending' | 'Awaiting_Payment' | 'Confirmed' | 'Checked_In' | 'Awaiting_Checkout' | 'Checked_Out' | 'Cancelled';
  paymentDeadline?: string;
  customSetupNote?: string;
  snapshotBasePrice: number;
  snapshotPriceModifier: number;
  createdAt: string;
  bookingCode: string;
  setupTaskStatus?: string;
  customerName?: string;
  customerPhone?: string;
  createdByUserId?: number;
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
  customerName?: string;
  customerPhone?: string;
  createdByUserId?: number;
}

export interface ActiveBookingSpaceAsset {
  assetName: string;
  locationName: string;
  dimensions: string;
  areaM2: number;
  capacity: number;
}

export interface ActiveBookingRoomLayout {
  layoutName: string;
}

export interface ActiveBookingService {
  serviceId: number;
  serviceName: string;
  quantity: number;
  snapshotUnitPrice: number;
  isIncurred: boolean;
  paymentStatus: 'Paid' | 'Unpaid';
}

export interface ActiveBookingResponse {
  booking: Booking;
  spaceAsset: ActiveBookingSpaceAsset;
  roomLayout: ActiveBookingRoomLayout;
  services: ActiveBookingService[];
  prepaidFee: number;
  incurredUnpaidTotal: number;
  totalAmount: number;
}
