import React from 'react';
import { VisualFloorMapModal } from './components/VisualFloorMapModal';
import { BookingDetailModal } from './components/BookingDetailModal';
import { BookingCheckoutModal } from './components/BookingCheckoutModal';
import { BookingTimeline } from './components/BookingTimeline';
import { BookingHistoryTable } from './components/BookingHistoryTable';
import { BookingForm } from './components/BookingForm';
import { bookingService } from '../../services/bookingService';
import BookingTabNav from './components/BookingTabNav';
import { useBookings } from './hooks/useBookings';

const Bookings: React.FC = () => {
  const {
    user,
    bookings,
    loading,
    spaceAssets,
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
    activeTab, setActiveTab,
    timelineDate, setTimelineDate,
    isMapModalOpen, setIsMapModalOpen,
    checkoutDetails, setCheckoutDetails,
    selectedBookingDetails, setSelectedBookingDetails,
    fetchBookings,
    handleCreate,
    handleDelete,
    handleCheckin,
    handlePayFinal,
    handleConfirmCheckout,
  } = useBookings();

  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Lịch đặt chỗ
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Quản lý lịch làm việc và đặt chỗ của bạn tại Cozy Space.
      </p>

      {/* Tab Nav — ADMIN/STAFF only */}
      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
        <BookingTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
        {/* Left: History table or Timeline */}
        {activeTab === 'history' ? (
          <BookingHistoryTable
            bookings={bookings}
            spaceAssets={spaceAssets}
            user={user}
            onViewDetails={async (id) => {
              try {
                const details = await bookingService.getBookingDetails(id);
                setSelectedBookingDetails(details);
              } catch {
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
                const resData = await bookingService.getCheckoutPreview(b.id);
                setCheckoutDetails({
                  booking: b,
                  services: resData.services,
                  invoice: resData.invoice,
                });
              } catch (e: any) {
                alert(e.response?.data?.message || 'Lỗi khi chuẩn bị checkout');
              }
            }}
            onCheckin={handleCheckin}
            onDelete={handleDelete}
            loading={loading}
          />
        ) : (
          <BookingTimeline
            bookings={bookings}
            spaceAssets={spaceAssets}
            timelineDate={timelineDate}
            setTimelineDate={setTimelineDate}
            onSelectBooking={async (b) => {
              try {
                const details = await bookingService.getBookingDetails(b.id);
                setSelectedBookingDetails(details);
              } catch {
                alert('Lỗi khi tải chi tiết đặt chỗ.');
              }
            }}
          />
        )}

        {/* Right: Booking Form */}
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
        onRefresh={fetchBookings}
      />

      <BookingCheckoutModal
        details={checkoutDetails}
        onClose={() => {
          setCheckoutDetails(null);
          fetchBookings();
        }}
        onConfirmCheckout={async () => {
          if (checkoutDetails) {
            await handleConfirmCheckout(checkoutDetails.booking.id);
          }
        }}
        onPayFinal={async () => {
          if (checkoutDetails) {
            await handlePayFinal(checkoutDetails.booking.id);
          }
        }}
        spaceAssets={spaceAssets}
      />
    </div>
  );
};

export default Bookings;
