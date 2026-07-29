import React, { useState } from 'react';
import { useBookings } from './hooks/useBookings';
import { BookingToolbar } from './components/BookingToolbar';
import { BookingDataTable } from './components/BookingDataTable';
import { BookingForm } from './components/BookingForm';
import { BookingModalsContainer } from './components/BookingModalsContainer';
import { bookingService } from '../../services/bookingService';

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
    fetchBookings,
    handleCreate,
    handleDelete,
    handleCheckin,
    handlePayFinal,
    handleConfirmCheckout,
    isMapModalOpen, setIsMapModalOpen,
    checkoutDetails, setCheckoutDetails,
    selectedBookingDetails, setSelectedBookingDetails,
  } = useBookings();

  // Toolbar & filter states
  const [statusFilter, setStatusFilter] = useState('Checked_In'); // Default to Active ("Đang hoạt động")
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Selected booking for quick action details
  const [selectedRowId, setSelectedRowId] = useState<number | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Apply real-time filtering on client-side
  const filteredBookings = bookings.filter((b) => {
    // 1. Status Filter
    if (statusFilter !== 'ALL' && b.bookingStatus !== statusFilter) return false;

    // 2. Search Filter (Room Name or Booking Code)
    const asset = spaceAssets.find((a) => a.id === b.assetId || a.Id === b.assetId);
    const roomName = asset?.assetName || '';
    const searchLower = searchTerm.toLowerCase();
    if (searchTerm && 
        !roomName.toLowerCase().includes(searchLower) && 
        !b.bookingCode.toLowerCase().includes(searchLower)) {
      return false;
    }

    // 3. Time Filter
    if (startDateFilter && new Date(b.startTime) < new Date(startDateFilter + 'T00:00:00')) return false;
    if (endDateFilter && new Date(b.endTime) > new Date(endDateFilter + 'T23:59:59')) return false;

    return true;
  });

  return (
    <div>
      <h1 className="page-title">Quản lý Đơn đặt phòng</h1>
      <p className="page-desc">
        Tìm kiếm, phân loại và quản lý tập trung tất cả các đơn đặt phòng tại Cozy Space.
      </p>



      {/* Filter toolbar */}
      <BookingToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        startDateFilter={startDateFilter}
        onStartDateChange={setStartDateFilter}
        endDateFilter={endDateFilter}
        onEndDateChange={setEndDateFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Data Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <BookingDataTable
          bookings={filteredBookings}
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
              alert('Thanh toán thành công!');
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
          selectedBookingId={selectedRowId}
          onSelectBooking={setSelectedRowId}
        />
      )}

      {/* Booking Form in Floating Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: 'var(--shadow)'
          }}>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                fetchBookings();
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--secondary-text)'
              }}
            >
              ×
            </button>
            <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>➕ Đăng ký đặt phòng mới</h3>
            
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
              onSubmit={async (e) => {
                await handleCreate(e);
              }}
              onOpenMapModal={() => setIsMapModalOpen(true)}
              error={error}
              success={success}
            />
          </div>
        </div>
      )}

      {/* Modals Container */}
      <BookingModalsContainer
        isMapModalOpen={isMapModalOpen}
        setIsMapModalOpen={setIsMapModalOpen}
        selectedBookingDetails={selectedBookingDetails}
        setSelectedBookingDetails={setSelectedBookingDetails}
        checkoutDetails={checkoutDetails}
        setCheckoutDetails={setCheckoutDetails}
        spaceAssets={spaceAssets}
        setAssetId={setAssetId}
        fetchBookings={fetchBookings}
        handleConfirmCheckout={handleConfirmCheckout}
        handlePayFinal={handlePayFinal}
      />
    </div>
  );
};

export default Bookings;

