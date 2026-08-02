import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import api from '../../services/api';
import { RequestForm } from './components/RequestForm';
import { RequestTimeline } from './components/RequestTimeline';

interface ServiceRequest {
  id: number;
  type: 'SERVICE' | 'INCIDENT';
  title: string;
  detail: string;
  roomName: string;
  status: 'Pending' | 'In_Progress' | 'Resolved';
  createdAt: string;
}

const ServiceRequests: React.FC = () => {


  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | ''>('');
  const [addonServices, setAddonServices] = useState<any[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all bookings and filter active (Checked_In) ones, and fetch addon menu
  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingBookings(true);
        const [bookingsData, addonsData] = await Promise.all([
          bookingService.getBookings(),
          bookingService.getAddOnServices()
        ]);
        
        // Filter Checked_In (Active) bookings
        const active = bookingsData.filter(b => b.bookingStatus === 'Checked_In');
        setActiveBookings(active);
        setAddonServices(addonsData);

        if (active.length > 0) {
          setSelectedBookingId(active[0].id);
        }
      } catch (err) {
        console.error('Error fetching service page initial data:', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    initData();
  }, []);

  // Fetch requests when selected booking changes
  const fetchRequests = async () => {
    if (!selectedBookingId) {
      setRequests([]);
      return;
    }
    const currentBooking = activeBookings.find(b => b.id === selectedBookingId);
    if (!currentBooking) return;
    
    setLoadingRequests(true);
    try {
      const res = await api.get<ServiceRequest[]>('/my-requests');
      const roomName = currentBooking.spaceAsset?.assetName || `Phòng #${currentBooking.assetId}`;
      const filtered = (res.data || []).filter(
        (r) => r.roomName.toLowerCase().trim() === roomName.toLowerCase().trim()
      );
      setRequests(filtered);
    } catch (err) {
      console.error('Error fetching requests timeline:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedBookingId, activeBookings]);

  const handleSubmitRequest = async (formData: { type: 'SERVICE' | 'INCIDENT'; serviceId?: number; quantity?: number; title: string; detail: string }) => {
    if (!selectedBookingId) return;
    const currentBooking = activeBookings.find(b => b.id === selectedBookingId);
    if (!currentBooking) return;

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await api.post('/my-requests', {
        bookingId: selectedBookingId,
        requestType: formData.type,
        title: formData.title,
        detail: formData.detail,
        roomName: currentBooking.spaceAsset?.assetName || `Phòng #${currentBooking.assetId}`,
        serviceId: formData.serviceId || null,
        quantity: formData.quantity || 1,
      });

      setSuccessMsg('✅ Gửi yêu cầu hỗ trợ thành công!');
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBookings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Dịch vụ & Hỗ trợ</h1>
      <p className="page-desc">
        Yêu cầu nước uống, đồ ăn nhẹ hoặc báo cáo sự cố kỹ thuật của phòng họp đang sử dụng.
      </p>

      {activeBookings.length === 0 ? (
        <div className="panel-card" style={{ backgroundColor: 'var(--surface-color)', padding: '50px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🛎️</span>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>Không tìm thấy phòng họp đang sử dụng</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 24px auto', fontSize: '0.9rem', color: 'var(--secondary-text)' }}>
            Bạn hiện không có phòng họp nào trong thời gian hoạt động (Đang check-in). Tính năng gửi yêu cầu hỗ trợ chỉ khả dụng đối với phòng đang được check-in sử dụng.
          </p>
          <a href="/bookings" className="btn btn-primary" style={{ display: 'inline-block', padding: '10px 20px', fontWeight: 'bold', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: '8px' }}>
            Quản lý đặt phòng để Check-in
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          <RequestForm
            activeBookings={activeBookings}
            selectedBookingId={selectedBookingId}
            onBookingChange={setSelectedBookingId}
            addonServices={addonServices}
            onSubmit={handleSubmitRequest}
            submitting={submitting}
            successMsg={successMsg}
            errorMsg={errorMsg}
          />
          <RequestTimeline
            requests={requests}
            loading={loadingRequests}
          />
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
