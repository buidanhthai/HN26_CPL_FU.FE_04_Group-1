import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import api from '../services/api';
import type { Booking, CreateBookingRequest } from '../types/booking.types';
import Button from '../components/Button';
import theBuildingImg from '../assets/thebuilding.png';

const ROOM_LAYOUTS: Record<number, { top: string; left: string; width: string; height: string }> = {
  1: { top: '65%', left: '26%', width: '22%', height: '24%' }, 
  2: { top: '75%', left: '54%', width: '16%', height: '17%' }, 
  3: { top: '75%', left: '71%', width: '21%', height: '17%' }, 
  4: { top: '40%', left: '23%', width: '12%', height: '14%' }, 
  5: { top: '44%', left: '36%', width: '12%', height: '12%' }, 
  6: { top: '44%', left: '67%', width: '11%', height: '13%' }, 
  7: { top: '44%', left: '79%', width: '12%', height: '13%' }, 
  8: { top: '12%', left: '23%', width: '13%', height: '15%' }, 
  9: { top: '16%', left: '38%', width: '10%', height: '12%' }, 
  10: { top: '17%', left: '60%', width: '14%', height: '15%' }, 
  11: { top: '19%', left: '77%', width: '14%', height: '14%' }
};

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
  const [checkinCodes, setCheckinCodes] = useState<{[key: number]: string}>({});
  
  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapCurrentFloor, setMapCurrentFloor] = useState('Lầu 1');
  const [mapSelectedRoom, setMapSelectedRoom] = useState<any | null>(null);
  const [mapHoveredRoom, setMapHoveredRoom] = useState<any | null>(null);
  const [mapMousePos, setMapMousePos] = useState({ x: 0, y: 0 });
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
      // Fallback
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

    const request: CreateBookingRequest = {
      userId: user?.id || 0,
      assetId,
      layoutId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      snapshotBasePrice: basePrice,
      snapshotPriceModifier: layoutId === 1 ? 50000 : 0
    };

    try {
      const newBooking = await bookingService.createBooking(request);
      setBookings([...bookings, newBooking]);
      setSuccess('Đặt chỗ thành công! Vui lòng thanh toán trong vòng 10 phút.');
      setStartDate('');
      setEndDate('');
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
        {/* Bookings List */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Danh sách đặt chỗ sắp tới
          </h2>

          {loading ? (
            <p style={{ color: 'var(--secondary-text)' }}>Đang tải danh sách đặt chỗ...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: 'var(--secondary-text)' }}>Chưa có lịch đặt chỗ nào.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--primary-text)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--secondary-text)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px 8px' }}>Không gian</th>
                    <th style={{ padding: '12px 8px' }}>Bắt đầu</th>
                    <th style={{ padding: '12px 8px' }}>Kết thúc</th>
                    <th style={{ padding: '12px 8px' }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td 
                        onClick={async () => {
                          try {
                            const details = await bookingService.getBookingDetails(b.id);
                            setSelectedBookingDetails(details);
                          } catch (err: any) {
                            alert('Lỗi khi tải chi tiết đặt chỗ.');
                          }
                        }}
                        style={{ 
                          padding: '14px 8px', 
                          fontWeight: '600', 
                          color: 'var(--accent-color)', 
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        title="Click để xem chi tiết"
                      >
                        {spaceAssets.find(a => a.id === b.assetId)?.assetName || `Phòng #${b.assetId}`}
                      </td>
                      <td style={{ padding: '14px 8px', color: 'var(--secondary-text)' }}>{new Date(b.startTime).toLocaleString()}</td>
                      <td style={{ padding: '14px 8px', color: 'var(--secondary-text)' }}>{new Date(b.endTime).toLocaleString()}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: 
                            b.bookingStatus === 'Confirmed' ? 'rgba(122, 134, 106, 0.15)' :
                            b.bookingStatus === 'Checked_In' ? 'rgba(9, 133, 242, 0.15)' :
                            b.bookingStatus === 'Checked_Out' ? 'rgba(108, 117, 125, 0.15)' :
                            b.bookingStatus === 'Cancelled' ? 'rgba(224, 122, 95, 0.15)' : 'rgba(212, 163, 115, 0.15)',
                          color: 
                            b.bookingStatus === 'Confirmed' ? 'var(--nature-accent)' :
                            b.bookingStatus === 'Checked_In' ? '#0985f2' :
                            b.bookingStatus === 'Checked_Out' ? '#6c757d' :
                            b.bookingStatus === 'Cancelled' ? '#e07a5f' : 'var(--accent-color)',
                        }}>
                          {b.bookingStatus === 'Awaiting_Payment' ? 'Chờ thanh toán' :
                           b.bookingStatus === 'Confirmed' ? 'Đã xác nhận' :
                           b.bookingStatus === 'Checked_In' ? 'Đã Check-in' :
                           b.bookingStatus === 'Checked_Out' ? 'Đã Checkout' :
                           b.bookingStatus === 'Cancelled' ? 'Đã hủy do chưa thanh toán đặt trước' : b.bookingStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            onClick={async () => {
                              try {
                                const details = await bookingService.getBookingDetails(b.id);
                                setSelectedBookingDetails(details);
                              } catch (err: any) {
                                alert('Lỗi khi tải chi tiết đặt chỗ.');
                              }
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--accent-color)',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              padding: '4px 8px'
                            }}
                          >
                            Chi tiết
                          </button>
                          {b.bookingStatus === 'Awaiting_Payment' && (
                            <button
                              onClick={async () => {
                                try {
                                  await bookingService.confirmPayment(b.id);
                                  alert('Thanh toán giả lập thành công!');
                                  fetchBookings();
                                } catch (e: any) {
                                  alert(e.response?.data?.message || 'Lỗi thanh toán');
                                }
                              }}
                              style={{
                                backgroundColor: 'var(--accent-color)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              Thanh toán
                            </button>
                          )}
                          {b.bookingStatus === 'Confirmed' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                              {user?.role === 'USER' ? (
                                !b.checkInVerificationCode ? (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await bookingService.requestCheckinCode(b.id);
                                        alert('Yêu cầu mã check-in thành công!');
                                        fetchBookings();
                                      } catch (e: any) {
                                        alert(e.response?.data?.message || 'Lỗi yêu cầu mã check-in');
                                      }
                                    }}
                                    style={{
                                      backgroundColor: 'var(--accent-color)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '6px 12px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    Yêu cầu Check-in
                                  </button>
                                ) : (
                                  <div style={{
                                    padding: '6px 10px',
                                    backgroundColor: 'rgba(9, 133, 242, 0.1)',
                                    borderRadius: '6px',
                                    border: '1px dashed #0985f2',
                                    color: '#0985f2',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem'
                                  }}>
                                    Mã Check-in: {b.checkInVerificationCode}
                                  </div>
                                )
                              ) : (
                                b.checkInVerificationCode ? (
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      placeholder="Mã check-in..."
                                      value={checkinCodes[b.id] || ''}
                                      onChange={(e) => setCheckinCodes({ ...checkinCodes, [b.id]: e.target.value })}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-color)',
                                        width: '100px',
                                        fontSize: '0.8rem'
                                      }}
                                    />
                                    <button
                                      onClick={async () => {
                                        try {
                                          const enteredCode = checkinCodes[b.id] || '';
                                          if (!enteredCode.trim()) {
                                            alert('Vui lòng nhập mã check-in.');
                                            return;
                                          }
                                          await bookingService.checkinBooking(b.id, enteredCode);
                                          alert('Check-in thành công!');
                                          setCheckinCodes({ ...checkinCodes, [b.id]: '' });
                                          fetchBookings();
                                        } catch (e: any) {
                                          alert(e.response?.data?.message || 'Lỗi khi check-in');
                                        }
                                      }}
                                      style={{
                                        backgroundColor: '#0985f2',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      Xác nhận
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                                    Chờ khách nhận mã
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          {b.bookingStatus === 'Checked_In' && user?.role !== 'USER' && (
                            <button
                              onClick={async () => {
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
                              style={{
                                backgroundColor: 'var(--nature-accent)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              Checkout
                            </button>
                          )}
                          {b.bookingStatus === 'Cancelled' && (
                            <button 
                              onClick={() => handleDelete(b.id)}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#e07a5f',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                transition: 'var(--transition)'
                              }}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Booking Form */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Thêm lịch đặt mới
          </h2>

          {error && (
            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(224, 122, 95, 0.12)', color: '#e07a5f', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</div>
          )}
          {success && (
            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(122, 134, 106, 0.12)', color: 'var(--nature-accent)', fontSize: '0.85rem', marginBottom: '15px' }}>{success}</div>
          )}

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Không gian</label>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--accent-color)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    textDecoration: 'underline'
                  }}
                >
                  🗺️ Chọn qua sơ đồ
                </button>
              </div>
              <select 
                value={assetId} 
                onChange={(e) => setAssetId(Number(e.target.value))}
                className="input-field"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              >
                {spaceAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetName} ({asset.locationName}) - {asset.basePrice.toLocaleString()}đ/h
                  </option>
                ))}
              </select>
            </div>

            {assetId === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Bố trí bàn ghế (Layout)</label>
                <select 
                  value={layoutId} 
                  onChange={(e) => setLayoutId(Number(e.target.value))}
                  className="input-field"
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                >
                  <option value={1}>Chữ U (+50,000đ - 15p setup)</option>
                  <option value={2}>Lớp học (+0đ - 20p setup)</option>
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Ngày bắt đầu</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Giờ</label>
                <input type="time" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} className="input-field" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Ngày kết thúc</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Giờ</label>
                <input type="time" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)} className="input-field" />
              </div>
            </div>

            <Button type="submit" style={{ marginTop: '10px' }}>Đặt chỗ ngay</Button>
          </form>
        </div>
      </div>

      {/* Checkout Invoice Modal */}
      {checkoutDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '30px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'var(--primary-text)',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              margin: '0 0 20px 0',
              fontFamily: 'var(--font-title)',
              textAlign: 'center',
              color: 'var(--nature-accent)',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '10px'
            }}>
              CHI TIẾT HÓA ĐƠN THANH TOÁN
            </h3>

            {/* Room Info */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600' }}>Phòng đặt:</span>
                <span>{spaceAssets.find(a => a.id === checkoutDetails.booking.assetId)?.assetName || `Phòng #${checkoutDetails.booking.assetId}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600' }}>Thời gian:</span>
                <span style={{ color: 'var(--secondary-text)' }}>
                  {new Date(checkoutDetails.booking.startTime).toLocaleTimeString()} - {new Date(checkoutDetails.booking.endTime).toLocaleTimeString()} ({new Date(checkoutDetails.booking.startTime).toLocaleDateString()})
                </span>
              </div>
            </div>

            {/* Room fee detail */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
              <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Chi phí phòng thuê</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Giá cơ bản:</span>
                <span>{checkoutDetails.booking.snapshotBasePrice.toLocaleString()}đ</span>
              </div>
              {checkoutDetails.booking.snapshotPriceModifier > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Phí phụ trội sơ đồ bàn ghế:</span>
                  <span>{checkoutDetails.booking.snapshotPriceModifier.toLocaleString()}đ</span>
                </div>
              )}
            </div>

            {/* Services fee detail */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
              <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Dịch vụ phát sinh trong quá trình sử dụng</h4>
              {checkoutDetails.services.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0' }}>Không phát sinh dịch vụ.</p>
              ) : (
                checkoutDetails.services.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>{s.serviceName} (SL: {s.quantity})</span>
                    <span>{(s.snapshotUnitPrice * s.quantity).toLocaleString()}đ</span>
                  </div>
                ))
              )}
            </div>

            {/* Payment Summary */}
            <div style={{ backgroundColor: 'rgba(122, 134, 106, 0.08)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span>Tổng chi phí đơn đặt:</span>
                <span style={{ fontWeight: '600' }}>{checkoutDetails.invoice.totalAmount.toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--nature-accent)' }}>
                <span>Đã thanh toán trước:</span>
                <span>-{checkoutDetails.invoice.paidUpfront.toLocaleString()}đ</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 'bold' }}>
                <span>Tiền còn dư cần thu:</span>
                <span style={{ color: '#e07a5f' }}>{checkoutDetails.invoice.finalDue.toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '8px' }}>
                <span>Trạng thái hóa đơn:</span>
                <span style={{
                  fontWeight: 'bold',
                  color: checkoutDetails.invoice.paymentStatus === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
                }}>
                  {checkoutDetails.invoice.paymentStatus === 'Paid' ? 'Đã Thanh Toán Xong' : 'Chưa Thanh Toán'}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setCheckoutDetails(null);
                  fetchBookings();
                }}
                style={{
                  backgroundColor: 'var(--nature-accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 24px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                Đóng & Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detail Booking Modal */}
      {selectedBookingDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '24px',
            width: '650px',
            maxWidth: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'var(--primary-text)',
          }}>
            <h3 style={{
              fontSize: '1.4rem',
              margin: '0 0 20px 0',
              fontFamily: 'var(--font-title)',
              textAlign: 'center',
              color: 'var(--nature-accent)',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '10px'
            }}>
              CHI TIẾT ĐƠN ĐẶT PHÒNG #{selectedBookingDetails.booking.id}
            </h3>

            {/* Room details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Phòng đặt:</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
                  {spaceAssets.find(a => a.id === selectedBookingDetails.booking.assetId)?.assetName || `Phòng #${selectedBookingDetails.booking.assetId}`}
                </p>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Trạng thái:</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--nature-accent)' }}>
                  {selectedBookingDetails.booking.bookingStatus === 'Awaiting_Payment' ? 'Chờ thanh toán' :
                   selectedBookingDetails.booking.bookingStatus === 'Confirmed' ? 'Đã xác nhận' :
                   selectedBookingDetails.booking.bookingStatus === 'Checked_In' ? 'Đã Check-in' :
                   selectedBookingDetails.booking.bookingStatus === 'Checked_Out' ? 'Đã Checkout' :
                   selectedBookingDetails.booking.bookingStatus === 'Cancelled' ? 'Đã hủy do chưa thanh toán đặt trước' : selectedBookingDetails.booking.bookingStatus}
                </p>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Thời gian bắt đầu:</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                  {new Date(selectedBookingDetails.booking.startTime).toLocaleString()}
                </p>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Thời gian kết thúc:</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                  {new Date(selectedBookingDetails.booking.endTime).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Customer information (non-USER only) */}
            {selectedBookingDetails.user && (
              <div style={{
                backgroundColor: 'rgba(212, 163, 115, 0.08)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  Thông tin khách hàng đặt
                </h4>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>Họ tên:</span> {selectedBookingDetails.user.fullName}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>Email:</span> {selectedBookingDetails.user.email}
                  </div>
                </div>
              </div>
            )}

            {/* Services booked state */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                Trạng thái dịch vụ đang hoặc đã được đặt
              </h4>
              {selectedBookingDetails.services.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0' }}>Không sử dụng dịch vụ.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--secondary-text)', textAlign: 'left' }}>
                        <th style={{ padding: '6px 4px' }}>Tên dịch vụ</th>
                        <th style={{ padding: '6px 4px' }}>Số lượng</th>
                        <th style={{ padding: '6px 4px' }}>Đơn giá</th>
                        <th style={{ padding: '6px 4px' }}>Loại</th>
                        <th style={{ padding: '6px 4px' }}>Thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBookingDetails.services.map((s: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          <td style={{ padding: '8px 4px', fontWeight: '600' }}>{s.serviceName}</td>
                          <td style={{ padding: '8px 4px' }}>{s.quantity}</td>
                          <td style={{ padding: '8px 4px' }}>{s.snapshotUnitPrice.toLocaleString()}đ</td>
                          <td style={{ padding: '8px 4px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              backgroundColor: s.isIncurred ? 'rgba(224, 122, 95, 0.1)' : 'rgba(122, 134, 106, 0.1)',
                              color: s.isIncurred ? '#e07a5f' : 'var(--nature-accent)'
                            }}>
                              {s.isIncurred ? 'Phát sinh' : 'Đặt trước'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 4px' }}>
                            <span style={{
                              fontWeight: '600',
                              color: s.paymentStatus === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
                            }}>
                              {s.paymentStatus === 'Paid' ? 'Đã trả' : 'Chưa trả'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Invoices List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                Hóa đơn thanh toán
              </h4>
              {selectedBookingDetails.invoices.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0', fontStyle: 'italic' }}>Chưa xuất hóa đơn nào.</p>
              ) : (
                selectedBookingDetails.invoices.map((inv: any, idx: number) => (
                  <div key={idx} style={{
                    backgroundColor: 'rgba(122, 134, 106, 0.04)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: '600' }}>Loại hóa đơn:</span> {inv.invoiceType === 'Upfront' ? 'Trả trước' : 'Hóa đơn cuối'}
                      </div>
                      <div>
                        <span style={{ fontWeight: '600' }}>Ngày xuất:</span> {new Date(inv.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                      <div>
                        Tổng tiền: <strong>{inv.totalAmount.toLocaleString()}đ</strong>
                      </div>
                      <div>
                        Đã trả trước: <span style={{ color: 'var(--nature-accent)' }}>{inv.paidUpfront.toLocaleString()}đ</span>
                      </div>
                      <div>
                        Phải thu thêm: <span style={{ color: '#e07a5f', fontWeight: 'bold' }}>{inv.finalDue.toLocaleString()}đ</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Trạng thái thanh toán:</span>
                      <span style={{
                        fontWeight: 'bold',
                        color: inv.paymentStatus === 'Paid' ? 'var(--nature-accent)' : '#e07a5f'
                      }}>
                        {inv.paymentStatus === 'Paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Audit Logs */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                Lịch sử thao tác trên hệ thống
              </h4>
              {selectedBookingDetails.logs.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0', fontStyle: 'italic' }}>Chưa có thao tác nào ghi lại.</p>
              ) : (
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  {selectedBookingDetails.logs.map((log: any, idx: number) => (
                    <div key={idx} style={{
                      padding: '8px 12px',
                      borderBottom: idx < selectedBookingDetails.logs.length - 1 ? '1px solid var(--border-color)' : 'none',
                      fontSize: '0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{log.userFullName}</span>: {log.actionDescription}
                      </div>
                      <div style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                style={{
                  backgroundColor: 'var(--nature-accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 24px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Floor Map Selector Modal */}
      {isMapModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '24px',
            width: '1000px',
            maxWidth: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'var(--primary-text)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.4rem' }}>🗺️ Sơ đồ chọn phòng họp</h3>
              <button 
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--secondary-text)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                &times;
              </button>
            </div>

            {/* Floor Selection Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['Lầu 1', 'Lầu 2', 'Lầu 3'].map((floor) => (
                <button
                  key={floor}
                  type="button"
                  onClick={() => {
                    setMapCurrentFloor(floor);
                    setMapSelectedRoom(null);
                    setMapHoveredRoom(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: mapCurrentFloor === floor ? 'var(--accent-color)' : 'transparent',
                    color: mapCurrentFloor === floor ? '#fff' : 'var(--primary-text)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'var(--transition)'
                  }}
                >
                  {floor}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
              
              {/* Left Column: Interactive Map */}
              <div style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <img 
                  src={theBuildingImg} 
                  alt="Sơ đồ Cozy Space" 
                  style={{ width: '100%', display: 'block', height: 'auto' }} 
                />
                
                {spaceAssets
                  .filter(asset => asset.locationName === mapCurrentFloor)
                  .map((asset) => {
                    const layout = ROOM_LAYOUTS[asset.id];
                    if (!layout) return null;

                    const isCurrentSelected = mapSelectedRoom?.id === asset.id;

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setMapSelectedRoom(asset)}
                        style={{
                          position: 'absolute',
                          top: layout.top,
                          left: layout.left,
                          width: layout.width,
                          height: layout.height,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          borderRadius: '4px',
                          backgroundColor: isCurrentSelected ? 'rgba(0, 86, 179, 0.35)' : 'transparent',
                          border: isCurrentSelected ? '2px solid #0056b3' : '2px dashed transparent'
                        }}
                        onMouseEnter={(e) => {
                          setMapHoveredRoom(asset);
                          if (!isCurrentSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
                            e.currentTarget.style.borderColor = '#28a745';
                          }
                        }}
                        onMouseMove={(e) => {
                          setMapMousePos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={(e) => {
                          setMapHoveredRoom(null);
                          if (!isCurrentSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }
                        }}
                      >
                        {(mapHoveredRoom?.id === asset.id || isCurrentSelected) && (
                          <span style={{
                            backgroundColor: 'var(--surface-color)',
                            color: 'var(--primary-text)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            boxShadow: 'var(--shadow)',
                            border: '1px solid var(--border-color)',
                            pointerEvents: 'none'
                          }}>
                            {asset.assetName}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Right Column: Selected Room Details & Confirm Button */}
              <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontFamily: 'var(--font-title)' }}>
                  Chi tiết phòng chọn
                </h4>
                
                {mapSelectedRoom ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}><strong>Tên phòng:</strong> {mapSelectedRoom.assetName}</p>
                    <p style={{ margin: 0 }}><strong>Vị trí:</strong> {mapSelectedRoom.locationName}</p>
                    <p style={{ margin: 0 }}><strong>Sức chứa:</strong> {mapSelectedRoom.capacity} người</p>
                    <p style={{ margin: 0 }}><strong>Kích thước:</strong> {mapSelectedRoom.dimensions || 'N/A'} ({mapSelectedRoom.areaM2 || 'N/A'} m²)</p>
                    <p style={{ margin: 0 }}><strong>Giá thuê:</strong> <span style={{ color: '#e07a5f', fontWeight: 'bold' }}>{(mapSelectedRoom.basePrice ?? 0).toLocaleString()}đ/h</span></p>

                    <button
                      type="button"
                      onClick={() => {
                        setAssetId(mapSelectedRoom.id);
                        setIsMapModalOpen(false);
                      }}
                      style={{
                        marginTop: '15px',
                        padding: '10px',
                        backgroundColor: 'var(--nature-accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Xác nhận chọn phòng
                    </button>
                  </div>
                ) : (
                  <p style={{ color: 'var(--secondary-text)', fontStyle: 'italic', margin: 0, fontSize: '0.85rem' }}>
                    Rê chuột vào sơ đồ và click để chọn phòng.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {mapHoveredRoom && (
        <div style={{
          position: 'fixed',
          top: mapMousePos.y + 15,
          left: mapMousePos.x + 15,
          backgroundColor: 'rgba(23, 23, 23, 0.95)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          lineHeight: '1.6',
          minWidth: '220px'
        }}>
          <b style={{ color: '#4ba35b', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
            🏢 {mapHoveredRoom.assetName}
          </b>
          <div style={{ borderBottom: '1px solid #444', marginBottom: '8px' }}></div>
          <p style={{ margin: '2px 0' }}>📍 <strong>Vị trí:</strong> {mapHoveredRoom.locationName}</p>
          <p style={{ margin: '2px 0' }}>👥 <strong>Sức chứa:</strong> {mapHoveredRoom.capacity} người</p>
          <p style={{ margin: '2px 0' }}>📐 <strong>Diện tích:</strong> {mapHoveredRoom.areaM2} m² ({mapHoveredRoom.dimensions})</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            💰 <strong>Giá thuê:</strong> <span style={{ color: '#ffdd57', fontWeight: 'bold' }}>{(mapHoveredRoom.basePrice ?? 0).toLocaleString()}đ/h</span>
          </p>
        </div>
      )}
      </div>
  );
};

export default Bookings;
