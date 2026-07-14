import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import api from '../services/api';
import type { Booking, CreateBookingRequest } from '../types/booking.types';
import { VisualFloorMapModal } from '../components/bookings/VisualFloorMapModal';
import { BookingDetailModal } from '../components/bookings/BookingDetailModal';
import { BookingCheckoutModal } from '../components/bookings/BookingCheckoutModal';
import { BookingTimeline } from '../components/bookings/BookingTimeline';
import { BookingHistoryTable } from '../components/bookings/BookingHistoryTable';
import { BookingForm } from '../components/bookings/BookingForm';

const Bookings: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [assetId, setAssetId] = useState(2); // Default to Meeting Room A (Họp Chiến Lược 102)
  const [layoutId, setLayoutId] = useState(1); // Default to Chữ U
  const [startDate, setStartDate] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('11:00');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'history' | 'timeline'>('history');
  const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
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
      // Fallback to mock space assets matching the database seed and FloorSelection layout
      const mockAssets = [
        { id: 1, locationName: 'Lầu 1', assetName: 'Hội Trường Lớn 101', assetType: 'Meeting_Room', basePrice: 300000, capacity: 15, dimensions: '6m x 5m', areaM2: 30, isActive: true },
        { id: 2, locationName: 'Lầu 1', assetName: 'Họp Chiến Lược 102', assetType: 'Meeting_Room', basePrice: 250000, capacity: 10, dimensions: '5m x 4m', areaM2: 20, isActive: true },
        { id: 3, locationName: 'Lầu 1', assetName: 'Tiếp Khách VIP 103', assetType: 'Meeting_Room', basePrice: 200000, capacity: 6, dimensions: '4m x 4m', areaM2: 16, isActive: true },
        { id: 4, locationName: 'Lầu 2', assetName: 'Phòng Dự Án 201', assetType: 'Meeting_Room', basePrice: 150000, capacity: 6, dimensions: '4m x 3m', areaM2: 12, isActive: true },
        { id: 5, locationName: 'Lầu 2', assetName: 'Phòng Dự Án 202', assetType: 'Meeting_Room', basePrice: 150000, capacity: 6, dimensions: '4m x 3m', areaM2: 12, isActive: true },
        { id: 6, locationName: 'Lầu 2', assetName: 'Phòng Phỏng Vấn 203', assetType: 'Meeting_Room', basePrice: 100000, capacity: 4, dimensions: '3m x 3m', areaM2: 9, isActive: true },
        { id: 7, locationName: 'Lầu 2', assetName: 'Phòng Nghiên Cứu 204', assetType: 'Meeting_Room', basePrice: 200000, capacity: 8, dimensions: '4m x 4m', areaM2: 16, isActive: true },
        { id: 8, locationName: 'Lầu 3', assetName: 'Họp Nhóm A', assetType: 'Meeting_Room', basePrice: 120000, capacity: 5, dimensions: '3.5m x 3m', areaM2: 10.5, isActive: true },
        { id: 9, locationName: 'Lầu 3', assetName: 'Họp Nhóm B', assetType: 'Meeting_Room', basePrice: 120000, capacity: 5, dimensions: '3.5m x 3m', areaM2: 10.5, isActive: true },
        { id: 10, locationName: 'Lầu 3', assetName: 'Hội Thảo 303', assetType: 'Meeting_Room', basePrice: 250000, capacity: 12, dimensions: '5m x 5m', areaM2: 25, isActive: true },
        { id: 11, locationName: 'Lầu 3', assetName: 'Đào Tạo 304', assetType: 'Meeting_Room', basePrice: 400000, capacity: 20, dimensions: '8m x 5m', areaM2: 40, isActive: true }
      ];
      setSpaceAssets(mockAssets);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchSpaceAssets();

    // Polling setup: refresh booking list every 30 seconds
    const intervalId = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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

    const selectedAsset = spaceAssets.find(a => a.id === assetId);
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
      createdByUserId: isStaffOrAdmin ? user?.id : undefined
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

  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Lịch đặt chỗ
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Quản lý lịch làm việc và đặt chỗ của bạn tại Cozy Space.
      </p>

      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'history' ? 'var(--accent-color)' : 'transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--primary-text)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'var(--transition)'
            }}
          >
            📋 Lịch sử đặt chỗ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'timeline' ? 'var(--accent-color)' : 'transparent',
              color: activeTab === 'timeline' ? '#fff' : 'var(--primary-text)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'var(--transition)'
            }}
          >
            📅 Sơ đồ Timeline hoạt động
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
        {/* Left Column: History list or Timeline schedule */}
        {activeTab === 'history' ? (
          <BookingHistoryTable
            bookings={bookings}
            spaceAssets={spaceAssets}
            user={user}
            onViewDetails={async (id) => {
              try {
                const details = await bookingService.getBookingDetails(id);
                setSelectedBookingDetails(details);
              } catch (err: any) {
                alert('Lỗi khi tải chi tiết đặt chỗ.');
              }
            }}
            onPayment={async (id) => {
              try {
                await bookingService.confirmPayment(id);
                alert('Thanh toán giả lập thành công!');
                fetchBookings();
              } catch (e: any) {
                alert(e.response?.data?.message || 'Lỗi thanh toán');
              }
            }}
            onCheckout={async (b) => {
              try {
                const services = await bookingService.getIncurredServices(b.id);
                const resData = await bookingService.checkoutBooking(b.id);
                setCheckoutDetails({
                  booking: b,
                  services: services,
                  invoice: resData.invoice
                });
              } catch (e: any) {
                alert(e.response?.data?.message || 'Lỗi khi checkout');
              }
            }}
            onDelete={handleDelete}
            loading={loading}
          />
        ) : (
          <BookingTimeline
            bookings={bookings}
            spaceAssets={spaceAssets}
            timelineDate={timelineDate}
            setTimelineDate={setTimelineDate}
            onSelectBooking={setSelectedBookingDetails}
          />
        )}

        {/* Right Column: Booking Creation Form */}
        <BookingForm
          user={user}
          spaceAssets={spaceAssets}
          assetId={assetId}
          setAssetId={setAssetId}
          layoutId={layoutId}
          setLayoutId={setLayoutId}
          startDate={startDate}
          setStartDate={setStartDate}
          startTimeStr={startTimeStr}
          setStartTimeStr={setStartTimeStr}
          endDate={endDate}
          setEndDate={setEndDate}
          endTimeStr={endTimeStr}
          setEndTimeStr={setEndTimeStr}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          onSubmit={handleCreate}
          onOpenMapModal={() => setIsMapModalOpen(true)}
          error={error}
          success={success}
        />
      </div>

      {/* Modals */}
      <VisualFloorMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        spaceAssets={spaceAssets}
        onSelectRoom={(room) => setAssetId(room.id)}
      />

      <BookingDetailModal
        details={selectedBookingDetails}
        onClose={() => setSelectedBookingDetails(null)}
        spaceAssets={spaceAssets}
      />

      <BookingCheckoutModal
        details={checkoutDetails}
        onClose={() => {
          setCheckoutDetails(null);
          fetchBookings();
        }}
        spaceAssets={spaceAssets}
      />
    </div>
  );
};

export default Bookings;
