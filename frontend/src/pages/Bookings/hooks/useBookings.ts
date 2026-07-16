import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { bookingService } from '../../../services/bookingService';
import api from '../../../services/api';
import type { Booking, CreateBookingRequest } from '../../../types/booking.types';

export function useBookings() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const location = useLocation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);

  // Form state
  const stateAssetId = (location.state as any)?.selectedAssetId;
  const [assetId, setAssetId] = useState<number>(stateAssetId ? Number(stateAssetId) : 2);
  const [layoutId, setLayoutId] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('11:00');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab & modal state
  const [activeTab, setActiveTab] = useState<'history' | 'timeline'>('history');
  const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<{
    booking: Booking;
    services: any[];
    invoice: any;
  } | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<{
    booking: Booking;
    user?: { fullName: string; email: string };
    services: any[];
    logs: any[];
    invoices: any[];
  } | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpaceAssets = async () => {
    try {
      const res = await api.get<any[]>('/space-assets');
      setSpaceAssets(res.data);
    } catch (err) {
      console.error('Error fetching space assets:', err);
      setSpaceAssets([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchSpaceAssets();

    // Polling: refresh booking list every 30 seconds
    const intervalId = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // --- Handlers ---

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !startTimeStr || !endDate || !endTimeStr) {
      setError('Vui lòng chọn đầy đủ thời gian.');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTimeStr}:00Z`);
    const endDateTime = new Date(`${endDate}T${endTimeStr}:00Z`);

    if (startDateTime >= endDateTime) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }

    const selectedAsset = spaceAssets.find((a) => a.id === assetId);
    const basePrice = selectedAsset ? selectedAsset.basePrice : 300000;
    const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

    const request: CreateBookingRequest = {
      userId: user?.id || 0,
      assetId,
      layoutId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      snapshotBasePrice: basePrice,
      snapshotPriceModifier: layoutId === 1 ? 50000 : 0,
      customerName: isStaffOrAdmin ? customerName : undefined,
      customerPhone: isStaffOrAdmin ? customerPhone : undefined,
      createdByUserId: isStaffOrAdmin ? user?.id : undefined,
    };

    try {
      const newBooking = await bookingService.createBooking(request);
      setBookings([...bookings, newBooking]);
      setSuccess('Đặt chỗ thành công! Vui lòng thanh toán trong vòng 10 phút.');
      setStartDate('');
      setEndDate('');
      setCustomerName('');
      setCustomerPhone('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt chỗ.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bookingService.deleteBooking(id);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setBookings(bookings.filter((b) => b.id !== id));
    }
  };

  const handleRequestCheckin = async (id: number) => {
    try {
      await bookingService.requestCheckinCode(id);
      alert('Yêu cầu mã check-in thành công!');
      fetchBookings();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi yêu cầu mã check-in');
    }
  };

  const handleCheckin = async (id: number, code: string) => {
    try {
      await bookingService.checkinBooking(id, code);
      alert('Check-in thành công!');
      fetchBookings();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi khi check-in');
    }
  };

  const handlePayFinal = async (id: number) => {
    try {
      await bookingService.payFinal(id);
      alert('Thanh toán hóa đơn cuối thành công!');
      fetchBookings();
      if (checkoutDetails && checkoutDetails.booking.id === id) {
        const resData = await bookingService.getCheckoutPreview(id);
        setCheckoutDetails({
          booking: checkoutDetails.booking,
          services: resData.services,
          invoice: resData.invoice,
        });
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi thanh toán hóa đơn cuối');
    }
  };

  const handleConfirmCheckout = async (id: number) => {
    try {
      await bookingService.checkoutBooking(id);
      alert('Checkout hoàn tất thành công!');
      setCheckoutDetails(null);
      fetchBookings();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi khi Checkout');
    }
  };

  return {
    // Auth
    user,
    // Data
    bookings,
    loading,
    spaceAssets,
    // Form state
    assetId, setAssetId,
    layoutId, setLayoutId,
    startDate, setStartDate,
    startTimeStr, setStartTimeStr,
    endDate, setEndDate,
    endTimeStr, setEndTimeStr,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    error,
    success,
    // Tab & modal state
    activeTab, setActiveTab,
    timelineDate, setTimelineDate,
    isMapModalOpen, setIsMapModalOpen,
    checkoutDetails, setCheckoutDetails,
    selectedBookingDetails, setSelectedBookingDetails,
    // Handlers
    fetchBookings,
    handleCreate,
    handleDelete,
    handleRequestCheckin,
    handleCheckin,
    handlePayFinal,
    handleConfirmCheckout,
  };
}
