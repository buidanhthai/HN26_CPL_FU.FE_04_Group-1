import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { Link } from 'react-router-dom';
import { ServiceMenuModal } from '../components/bookings/ServiceMenuModal';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user } = auth;

  // Active booking states (For USER role)
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [addonServices, setAddonServices] = useState<any[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);

  const fetchActiveBooking = async () => {
    try {
      setLoadingActive(true);
      const data = await bookingService.getActiveBooking();
      setActiveBooking(data);
    } catch (err: any) {
      console.error("Error fetching active booking:", err);
      setActiveBooking(null);
    } finally {
      setLoadingActive(false);
    }
  };

  const fetchAddonServices = async () => {
    try {
      const data = await bookingService.getAddOnServices();
      setAddonServices(data);
    } catch (err) {
      console.error("Error fetching addon services:", err);
    }
  };

  useEffect(() => {
    if (user?.role === 'USER') {
      fetchActiveBooking();
      fetchAddonServices();

      // Refresh every 15 seconds to sync incurred services / bill
      const interval = setInterval(() => {
        fetchActiveBooking();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // 1. RENDER USER DASHBOARD
  if (user?.role === 'USER') {
    return (
      <div style={{ paddingBottom: '40px' }}>
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 className="page-title">
              Xin chào, {user.fullName}!
            </h1>
            <p className="page-desc" style={{ margin: 0 }}>
              Chào mừng bạn quay trở lại với Cozy Space. Chúc bạn một ngày làm việc hiệu quả và nhiều cảm hứng!
            </p>
          </div>
          <button 
            onClick={fetchActiveBooking}
            className="btn btn-secondary hover-lift"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>

        {loadingActive ? (
          /* Loading State */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            backgroundColor: 'var(--surface-color)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            gap: '15px'
          }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(111, 78, 55, 0.1)',
              borderTop: '4px solid var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--secondary-text)', fontWeight: '600' }}>Đang kết nối tới Cozy Space...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : activeBooking ? (
          /* Active Booking Dashboard */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr',
            gap: '24px',
            alignItems: 'start'
          }}>
            
            {/* Main content: active session billing & address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Active Session Info Card */}
              <div style={{
                backgroundColor: 'var(--surface-color)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '6px',
                  height: '100%',
                  backgroundColor: 'var(--nature-accent)'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      backgroundColor: 'var(--nature-accent)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      animation: 'pulse 2s infinite'
                    }}>
                      Đang hoạt động
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', fontWeight: 'bold' }}>
                      Mã booking: #{activeBooking.booking.id}
                    </span>
                  </div>
                  {activeBooking.booking.checkInVerificationCode && (
                    <div style={{ backgroundColor: 'rgba(212, 163, 115, 0.15)', border: '1px solid var(--accent-color)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      Mã check-in: <strong>{activeBooking.booking.checkInVerificationCode}</strong>
                    </div>
                  )}
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
                  🏢 {activeBooking.spaceAsset.assetName}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem', color: 'var(--secondary-text)', marginBottom: '16px' }}>
                  <div>📍 <strong>Vị trí:</strong> {activeBooking.spaceAsset.locationName}</div>
                  <div>📐 <strong>Kích thước:</strong> {activeBooking.spaceAsset.dimensions} ({activeBooking.spaceAsset.areaM2} m²)</div>
                  <div>👥 <strong>Sức chứa tối đa:</strong> {activeBooking.spaceAsset.capacity} người</div>
                  <div>🛋️ <strong>Sơ đồ bày trí:</strong> {activeBooking.roomLayout.layoutName}</div>
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: 'var(--primary-text)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    🕒 <strong>Bắt đầu:</strong> {new Date(activeBooking.booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(activeBooking.booking.startTime).toLocaleDateString()})
                  </div>
                  <div>
                    🕒 <strong>Kết thúc:</strong> {new Date(activeBooking.booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(activeBooking.booking.endTime).toLocaleDateString()})
                  </div>
                </div>

                {/* Checkout Actions Panel */}
                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  marginTop: '16px',
                  paddingTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {activeBooking.booking.bookingStatus === 'Checked_In' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                        Bạn có thể gửi yêu cầu checkout khi kết thúc buổi làm việc.
                      </span>
                      <button
                        onClick={async () => {
                          if (window.confirm("Bạn có chắc chắn muốn gửi yêu cầu Checkout phòng?")) {
                            try {
                              await bookingService.requestCheckout(activeBooking.booking.id);
                              alert("Gửi yêu cầu Checkout thành công!");
                              fetchActiveBooking();
                            } catch (e: any) {
                              alert(e.response?.data?.message || "Lỗi khi yêu cầu Checkout");
                            }
                          }
                        }}
                        className="btn btn-danger hover-lift"
                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
                      >
                        🔔 Yêu cầu Checkout
                      </button>
                    </div>
                  )}

                  {activeBooking.booking.bookingStatus === 'Awaiting_Checkout' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{
                        backgroundColor: 'rgba(212, 163, 115, 0.12)',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '0.85rem',
                        color: 'var(--primary-text)'
                      }}>
                        📌 <strong>Trạng thái: Chờ Checkout.</strong>
                        {activeBooking.incurredUnpaidTotal > 0 ? (
                          <span> Vui lòng thực hiện thanh toán hóa đơn cuối cho các dịch vụ phát sinh để nhân viên xác nhận Checkout.</span>
                        ) : (
                          <span> Bạn đã hoàn tất các khoản thanh toán. Vui lòng chờ nhân viên kiểm tra và xác nhận Checkout để giải phóng phòng.</span>
                        )}
                      </div>
                      
                      {activeBooking.incurredUnpaidTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={async () => {
                              try {
                                await bookingService.payFinal(activeBooking.booking.id);
                                alert("Thanh toán hóa đơn cuối (Giả lập) thành công!");
                                fetchActiveBooking();
                              } catch (e: any) {
                                alert(e.response?.data?.message || "Lỗi khi thanh toán");
                              }
                            }}
                            className="btn btn-primary hover-lift"
                            style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
                          >
                            💳 Thanh toán cuối ({formatCurrency(activeBooking.incurredUnpaidTotal)})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <style>{`
                  @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(122, 134, 106, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(122, 134, 106, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(122, 134, 106, 0); }
                  }
                `}</style>
              </div>

              {/* Bill Details Card */}
              <div className="panel-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: 'var(--primary-text)', fontFamily: 'var(--font-title)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  💵 Chi tiết hóa đơn &amp; Dịch vụ hiện tại
                </h3>

                {/* Services Table */}
                <div className="table-container" style={{ marginBottom: '20px' }}>
                  <table className="theme-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr className="theme-tr-head">
                        <th className="theme-th" style={{ padding: '8px' }}>Tên dịch vụ</th>
                        <th className="theme-th" style={{ padding: '8px', textAlign: 'center' }}>Số lượng</th>
                        <th className="theme-th" style={{ padding: '8px', textAlign: 'right' }}>Đơn giá</th>
                        <th className="theme-th" style={{ padding: '8px', textAlign: 'right' }}>Thành tiền</th>
                        <th className="theme-th" style={{ padding: '8px', textAlign: 'center' }}>Loại</th>
                        <th className="theme-th" style={{ padding: '8px', textAlign: 'center' }}>Thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Space rent row */}
                      <tr className="theme-tr-body" style={{ color: 'var(--primary-text)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                          Tiền thuê phòng: {activeBooking.spaceAsset.assetName}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>1</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                          {formatCurrency(activeBooking.booking.snapshotBasePrice)}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency(activeBooking.booking.snapshotBasePrice)}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <span style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', padding: '2px 6px', backgroundColor: 'rgba(111, 78, 55, 0.08)', borderRadius: '4px' }}>
                            Đặt trước
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <span style={{ color: 'var(--nature-accent)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            ✓ Đã trả
                          </span>
                        </td>
                      </tr>

                      {/* Layout layout modifier row if modifier > 0 */}
                      {activeBooking.booking.snapshotPriceModifier > 0 && (
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--primary-text)' }}>
                          <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                            Phí thiết lập layout: {activeBooking.roomLayout.layoutName}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>1</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            {formatCurrency(activeBooking.booking.snapshotPriceModifier)}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>
                            {formatCurrency(activeBooking.booking.snapshotPriceModifier)}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <span style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', padding: '2px 6px', backgroundColor: 'rgba(111, 78, 55, 0.08)', borderRadius: '4px' }}>
                              Đặt trước
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <span style={{ color: 'var(--nature-accent)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              ✓ Đã trả
                            </span>
                          </td>
                        </tr>
                      )}

                      {/* Service rows */}
                      {activeBooking.services.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '15px', textAlign: 'center', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                            Chưa gọi thêm dịch vụ nào trong phiên làm việc.
                          </td>
                        </tr>
                      ) : (
                        activeBooking.services.map((svc: any) => (
                          <tr key={svc.serviceId} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--primary-text)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                              ☕ {svc.serviceName}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold' }}>{svc.quantity}</td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatCurrency(svc.snapshotUnitPrice)}</td>
                            <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>
                              {formatCurrency(svc.snapshotUnitPrice * svc.quantity)}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <span style={{ 
                                color: svc.isIncurred ? 'var(--accent-hover)' : 'var(--secondary-text)', 
                                fontSize: '0.75rem', 
                                padding: '2px 6px', 
                                backgroundColor: svc.isIncurred ? 'rgba(212, 163, 115, 0.15)' : 'rgba(111, 78, 55, 0.08)', 
                                borderRadius: '4px',
                                fontWeight: svc.isIncurred ? '500' : 'normal'
                              }}>
                                {svc.isIncurred ? 'Phát sinh' : 'Đặt trước'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              {svc.paymentStatus === 'Paid' ? (
                                <span style={{ color: 'var(--nature-accent)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  ✓ Đã trả
                                </span>
                              ) : (
                                <span style={{ color: '#D9534F', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  ✗ Chưa trả (Checkout)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Billing Summary */}
                <div style={{
                  backgroundColor: 'rgba(111, 78, 55, 0.04)',
                  padding: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--secondary-text)' }}>Phí thuê phòng (Đặt trước):</span>
                    <span style={{ fontWeight: '500' }}>{formatCurrency(activeBooking.prepaidFee)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--secondary-text)' }}>Dịch vụ phát sinh (Chưa trả):</span>
                    <span style={{ fontWeight: 'bold', color: '#D9534F' }}>{formatCurrency(activeBooking.incurredUnpaidTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary-text)' }}>
                    <span>Tổng giá trị hóa đơn (Tạm tính):</span>
                    <span>{formatCurrency(activeBooking.totalAmount)}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Right column: Order Services Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Order form card */}
              <div style={{
                backgroundColor: 'var(--surface-color)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)',
                position: 'sticky',
                top: '20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>☕</span>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
                  Gọi thêm dịch vụ
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0 0 20px 0', lineHeight: '1.6' }}>
                  Thêm cà phê thơm ngon, trà mát lạnh hoặc thuê thêm máy chiếu, các thiết bị hỗ trợ ngay trong phòng để nâng cao năng suất làm việc của bạn.
                </p>

                <button
                  onClick={() => setIsServiceMenuOpen(true)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--accent-color)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  className="hover-lift"
                >
                  🍽️ Mở thực đơn dịch vụ
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* Empty State: No active booking */
          <div style={{
            backgroundColor: 'var(--surface-color)',
            padding: '40px 30px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            boxShadow: 'var(--shadow)',
            maxWidth: '600px',
            margin: '40px auto 0 auto'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>☕</div>
            <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-text)', fontSize: '1.4rem', margin: '0 0 12px 0' }}>
              Bạn chưa bắt đầu phiên làm việc nào
            </h3>
            <p style={{ color: 'var(--secondary-text)', margin: '0 0 24px 0', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Bạn không có lịch đặt phòng/bàn làm việc nào đang trong khung giờ hoạt động (đã check-in). Hãy đặt ngay một không gian yên tĩnh và ấm áp tại Cozy Space nhé!
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/bookings" style={{
                display: 'inline-block',
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                transition: 'var(--transition)',
                boxShadow: '0 4px 6px -1px rgba(212, 163, 115, 0.4)',
                textDecoration: 'none'
              }} className="hover-lift">
                Đặt chỗ ngay
              </Link>
              <button
                onClick={() => setIsServiceMenuOpen(true)}
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--primary-text)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  transition: 'var(--transition)',
                  cursor: 'pointer'
                }}
                className="hover-lift"
              >
                🍽️ Xem thực đơn dịch vụ
              </button>
            </div>
          </div>
        )}

        {/* Unified Service Menu Modal at Root Level */}
        <ServiceMenuModal
          isOpen={isServiceMenuOpen}
          onClose={() => setIsServiceMenuOpen(false)}
          bookingId={activeBooking?.booking?.id}
          addonServices={addonServices}
          viewOnly={!activeBooking}
          onOrderSuccess={async () => {
            const updatedBooking = await bookingService.getActiveBooking();
            setActiveBooking(updatedBooking);
          }}
        />
      </div>
    );
  }

  // 2. RENDER ADMIN / STAFF DASHBOARD (RETAIN ORIGINAL DESIGN)
  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Bảng điều khiển
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Chào mừng quay trở lại không gian làm việc của bạn.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '35px'
      }}>
        {/* Card 1 */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          transition: 'var(--transition)'
        }} className="hover-lift">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--secondary-text)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Phiên làm việc hiện tại
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Đang hoạt động
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--nature-accent)', fontWeight: '600' }}>
            Tài khoản: {user?.fullName} ({user?.role})
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          transition: 'var(--transition)'
        }} className="hover-lift">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--secondary-text)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Trạng thái đặt chỗ
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Chờ xử lý
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            Lịch tiếp theo: Ngày mai lúc 10:00 sáng
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          transition: 'var(--transition)'
        }} className="hover-lift">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--secondary-text)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tiến độ công việc
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Đang vận hành
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--nature-accent)', fontWeight: '600' }}>
            Hệ thống đặt chỗ Cozy Space
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--surface-color)',
        padding: '30px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '1.4rem', margin: '0 0 15px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
          Hệ thống đặt chỗ Cozy Space
        </h2>
        <p style={{ margin: '0 0 15px 0', color: 'var(--secondary-text)', fontSize: '0.95rem', lineHeight: '1.7' }}>
          Chào mừng đến với Cozy Space. Hệ thống đặt chỗ làm việc on-demand được thiết kế đậm chất chill cafe, hỗ trợ tối đa việc tập trung làm việc linh hoạt, giảm thiểu cô lập xã hội. Bạn có thể dễ dàng quản lý lịch hẹn (Bookings) và công việc hàng ngày (Tasks) ngay trên thanh điều hướng bên trái.
        </p>
        <p style={{ margin: '0', color: 'var(--secondary-text)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Sử dụng các menu <strong>Lịch đặt chỗ</strong> hoặc <strong>Công việc của tôi</strong> trên thanh menu để bắt đầu trải nghiệm dịch vụ.
        </p>
      </div>

      {user?.role === 'ADMIN' && (
        <div style={{
          backgroundColor: 'rgba(212, 163, 115, 0.1)',
          padding: '30px',
          borderRadius: '16px',
          border: '1px solid rgba(212, 163, 115, 0.3)',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 15px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Quản trị viên (Admin Panel)
          </h2>
          <p style={{ margin: '0 0 15px 0', color: 'var(--secondary-text)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            Khu vực dành riêng cho Quản trị viên để quản lý toàn bộ hệ thống. Background service tự động hủy lịch chưa thanh toán sau 10 phút đang hoạt động.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
             <Link to="/space-assets" style={{
                display: 'inline-block',
                textDecoration: 'none',
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.9rem'
             }} className="hover-lift">
               Quản lý Tài sản (Space Assets)
             </Link>
             <button style={{
                backgroundColor: 'var(--surface-color)',
                color: 'var(--primary-text)',
                border: '1px solid var(--border-color)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer'
             }} onClick={() => alert('Chức năng Báo cáo doanh thu đang được phát triển.')}>
               Báo cáo Doanh thu
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
