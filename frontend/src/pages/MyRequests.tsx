import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { RequestList, type ServiceRequest, type AddOnService } from './MyRequests/components/RequestList';
import { CreateRequestForm } from './MyRequests/components/CreateRequestForm';

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOnServices, setAddOnServices] = useState<AddOnService[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Fetch requests & services ─────────────────────────────────────────────
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await api.get<ServiceRequest[]>('/my-requests');
        setRequests(res.data || []);
      } catch {
        // Fallback demo mock
        setRequests([
          {
            id: 1,
            type: 'SERVICE',
            title: 'Gọi thêm cà phê sữa đá (Số lượng: 2)',
            detail: 'Phòng cần thêm 2 ly cà phê sữa đá, không đường.',
            roomName: 'Họp Chiến Lược 102',
            status: 'Resolved',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 2,
            type: 'INCIDENT',
            title: 'Điều hòa không lạnh',
            detail: 'Nhiệt độ phòng vẫn cao dù đã bật điều hòa 30 phút.',
            roomName: 'Tiếp Khách VIP 103',
            status: 'In_Progress',
            createdAt: new Date(Date.now() - 900000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchAddOnServices = async () => {
      try {
        const res = await api.get<AddOnService[]>('/addon-services');
        setAddOnServices(res.data || []);
      } catch (err) {
        console.error('Error fetching addon services:', err);
      }
    };

    fetchRequests();
    fetchAddOnServices();
  }, []);

  // ─── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (formData: {
    type: 'SERVICE' | 'INCIDENT';
    title: string;
    detail: string;
    roomName: string;
    serviceId: number | null;
    quantity: number;
  }) => {
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await api.post('/my-requests', {
        requestType: formData.type,
        title: formData.title,
        detail: formData.detail,
        roomName: formData.roomName,
        serviceId: formData.serviceId,
        quantity: formData.quantity,
      });

      const newReq: ServiceRequest = {
        id: res.data.id || Date.now(),
        type: formData.type,
        title: formData.title,
        detail: formData.detail,
        roomName: formData.roomName,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setRequests((prev) => [newReq, ...prev]);
      setSuccessMsg('✅ Yêu cầu đã được gửi! Nhân viên sẽ phản hồi trong vài phút.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể gửi yêu cầu hỗ trợ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">📩 Yêu cầu của tôi</h1>
      <p className="page-desc">
        Gửi yêu cầu dịch vụ hoặc báo sự cố trong phòng — nhân viên CozySpace sẽ hỗ trợ ngay.
      </p>

      <div className="layout-grid-sidebar">
        <div className="panel-card">
          <h2 className="panel-title">Lịch sử yêu cầu</h2>
          <RequestList requests={requests} loading={loading} />
        </div>

        <CreateRequestForm
          addOnServices={addOnServices}
          submitting={submitting}
          onSubmit={handleSubmit}
          successMsg={successMsg}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
        />
      </div>
    </div>
  );
};

export default MyRequests;
