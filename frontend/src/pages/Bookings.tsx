import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import type { Booking, CreateBookingRequest } from '../types/booking.types';
import Button from '../components/Button';

const Bookings: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [assetId, setAssetId] = useState(2); // Default to Meeting Room A
  const [layoutId, setLayoutId] = useState(1); // Default to Chữ U
  const [startDate, setStartDate] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('11:00');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkinCodes, setCheckinCodes] = useState<{[key: number]: string}>({});
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

  useEffect(() => {
    fetchBookings();
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

    const request: CreateBookingRequest = {
      userId: user?.id || 0,
      assetId,
      layoutId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      snapshotBasePrice: assetId === 1 ? 50000 : 300000,
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
                        {b.assetId === 1 ? 'Hot Desk 101' : 'Meeting Room A'}
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
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Không gian</label>
              <select 
                value={assetId} 
                onChange={(e) => setAssetId(Number(e.target.value))}
                className="input-field"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              >
                <option value={1}>Hot Desk 101 (Cá nhân)</option>
                <option value={2}>Meeting Room A (Phòng họp)</option>
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
                <span>{checkoutDetails.booking.assetId === 1 ? 'Hot Desk 101' : 'Meeting Room A'}</span>
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
                  {selectedBookingDetails.booking.assetId === 1 ? 'Hot Desk 101' : 'Meeting Room A'}
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
      </div>
  );
};

export default Bookings;
