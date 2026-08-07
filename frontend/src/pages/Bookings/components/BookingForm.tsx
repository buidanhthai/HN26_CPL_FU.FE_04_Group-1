import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Button from '../../../components/Button';
import { bookingService } from '../../../services/bookingService';
import { AddonsModal } from './AddonsModal';
import { BookingPriceEstimate } from './BookingPriceEstimate';
import { BookingAvailabilityTimeline } from './BookingAvailabilityTimeline';

interface BookingFormProps {
  user: any;
  spaceAssets: any[];
  assetId: number;
  setAssetId: (val: number) => void;
  layoutId: number;
  setLayoutId: (val: number) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  startTimeStr: string;
  setStartTimeStr: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  endTimeStr: string;
  setEndTimeStr: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  onSubmit: (e: React.FormEvent, payNow: boolean, addons: { serviceId: number; quantity: number }[], customSetupNote: string) => Promise<void>;
  onOpenMapModal: () => void;
  error: string;
  success: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  user,
  spaceAssets,
  assetId,
  setAssetId,
  layoutId,
  setLayoutId,
  startDate,
  setStartDate,
  startTimeStr,
  setStartTimeStr,
  endDate,
  setEndDate,
  endTimeStr,
  setEndTimeStr,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  onSubmit,
  onOpenMapModal,
  error: propsError,
  success: propsSuccess,
}) => {
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  // State for Addon Services
  const [addonServices, setAddonServices] = useState<any[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [customSetupNote, setCustomSetupNote] = useState('');
  const [isAddonsModalOpen, setIsAddonsModalOpen] = useState(false);

  // State for estimate
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateResult, setEstimateResult] = useState({
    spaceCost: 0,
    addonsCost: 0,
    totalAmount: 0
  });

  const [submittingPayNow, setSubmittingPayNow] = useState(false);
  const [submittingPayLater, setSubmittingPayLater] = useState(false);

  // Fetch Addon Services
  useEffect(() => {
    bookingService.getAddOnServices()
      .then((data) => setAddonServices(data || []))
      .catch((err) => console.error('Error fetching services:', err));
  }, []);

  // Compute duration in hours
  const duration = useMemo(() => {
    if (!startDate || !startTimeStr || !endDate || !endTimeStr) return 0;
    const startDateTime = new Date(`${startDate}T${startTimeStr}:00`);
    const endDateTime = new Date(`${endDate}T${endTimeStr}:00`);
    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  }, [startDate, startTimeStr, endDate, endTimeStr]);

  const isPast = useMemo(() => {
    if (!startDate || !startTimeStr) return false;
    const selectedStart = new Date(`${startDate}T${startTimeStr}:00`);
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1);
    return selectedStart < now;
  }, [startDate, startTimeStr]);

  // Selected addon quantities in format { serviceId, quantity }
  const selectedAddonsList = useMemo(() => {
    return Object.entries(selectedQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        serviceId: Number(id),
        quantity: qty
      }));
  }, [selectedQuantities]);

  // Fetch estimate
  useEffect(() => {
    if (!assetId || duration <= 0) {
      setEstimateResult({ spaceCost: 0, addonsCost: 0, totalAmount: 0 });
      return;
    }

    setEstimateLoading(true);
    const addonIds = selectedAddonsList.map((x) => x.serviceId);
    
    const handler = setTimeout(() => {
      bookingService.calculateEstimate(assetId, layoutId, duration, addonIds, selectedAddonsList)
        .then((res) => {
          setEstimateResult({
            spaceCost: res.spaceCost || res.SpaceCost || 0,
            addonsCost: res.addonsCost || res.AddonsCost || 0,
            totalAmount: res.totalAmount || res.TotalAmount || 0
          });
        })
        .catch((err) => console.error('Error calculating estimate:', err))
        .finally(() => setEstimateLoading(false));
    }, 400);

    return () => clearTimeout(handler);
  }, [assetId, layoutId, duration, selectedAddonsList]);

  const handleQuantityChange = useCallback((serviceId: number, qty: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [serviceId]: qty
    }));
  }, []);

  const handleFormSubmit = async (e: React.FormEvent, payNow: boolean) => {
    e.preventDefault();
    if (payNow) {
      setSubmittingPayNow(true);
    } else {
      setSubmittingPayLater(true);
    }

    try {
      await onSubmit(e, payNow, selectedAddonsList, customSetupNote);
    } finally {
      setSubmittingPayNow(false);
      setSubmittingPayLater(false);
    }
  };

  return (
    <div className="panel-card" style={{ padding: '0', border: 'none', background: 'transparent', boxShadow: 'none' }}>
      {propsError && (
        <div className="badge-unassigned" style={{ display: 'block', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>{propsError}</div>
      )}
      {propsSuccess && (
        <div className="badge-completed" style={{ display: 'block', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>{propsSuccess}</div>
      )}

      <form className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* SECTION 1: Customer Information (Only for Staff/Admin) */}
        {isStaffOrAdmin && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(255,255,255,0.01)',
          }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>👤 Thông tin đặt hộ khách</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tên khách hàng</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="Tên khách hàng"
                  className="form-input" 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Số điện thoại</label>
                <input 
                  type="text" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="Số điện thoại"
                  className="form-input" 
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Space & Time Range Details */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255,255,255,0.01)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h4 style={{ margin: '0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>📍 Lựa chọn Không gian & Thời gian</h4>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Chọn không gian</label>
              <button
                type="button"
                onClick={onOpenMapModal}
                className="btn-link-primary"
                style={{ fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                🗺️ Sơ đồ tầng
              </button>
            </div>
            <select 
              value={assetId} 
              onChange={(e) => setAssetId(Number(e.target.value))}
              className="form-select"
            >
              {spaceAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetName} ({asset.locationName}) - {asset.basePrice.toLocaleString()}đ/h
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bắt đầu ngày</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Giờ bắt đầu</label>
              <input type="time" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} className="form-input" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Kết thúc ngày</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Giờ kết thúc</label>
              <input type="time" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)} className="form-input" required />
            </div>
          </div>

          <BookingAvailabilityTimeline
            assetId={assetId}
            selectedDate={startDate}
            startTimeStr={startTimeStr}
            endTimeStr={endTimeStr}
            onSelectTime={(start, end) => {
              setStartTimeStr(start);
              setEndTimeStr(end);
              if (!endDate || endDate !== startDate) {
                setEndDate(startDate);
              }
            }}
          />
        </div>

        {/* SECTION 3: Layout configuration (Only for rooms that support layouts) */}
        {assetId === 2 && (
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(255,255,255,0.01)',
          }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>🛋️ Bố trí phòng họp</h4>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sơ đồ bày trí bàn ghế (Layout)</label>
              <select 
                value={layoutId} 
                onChange={(e) => setLayoutId(Number(e.target.value))}
                className="form-select"
              >
                <option value={1}>Chữ U (+50,000đ - 15p setup)</option>
                <option value={2}>Lớp học (+0đ - 20p setup)</option>
              </select>
            </div>
          </div>
        )}

        {/* SECTION 4: Addon services selection button */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255,255,255,0.01)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ margin: '0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>🍽️ Dịch vụ & Đồ uống kèm theo</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
              {selectedAddonsList.length > 0 
                ? `Đã chọn ${selectedAddonsList.length} loại dịch vụ/đồ uống.`
                : 'Chưa lựa chọn dịch vụ kèm theo.'}
            </span>
            <button
              type="button"
              onClick={() => setIsAddonsModalOpen(true)}
              className="btn-card"
              style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto', minWidth: '150px', cursor: 'pointer' }}
            >
              🍔 Chọn dịch vụ (Menu)
            </button>
          </div>
        </div>

        {/* SECTION 5: Special Notes */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255,255,255,0.01)',
        }}>
          <h4 style={{ margin: '0 0 14px 0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>✍ Ghi chú đặc biệt</h4>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Yêu cầu thiết lập hoặc chuẩn bị thêm</label>
            <textarea
              value={customSetupNote}
              onChange={(e) => setCustomSetupNote(e.target.value)}
              placeholder="VD: Chuẩn bị bảng trắng, bút viết lông, máy chiếu sẵn cáp kết nối..."
              className="form-input"
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* SECTION 6: Detailed Bill Receipt Container Box */}
        {duration > 0 && (
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(255,255,255,0.01)',
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              📊 Bảng chi tiết hóa đơn tạm tính
            </h4>
            <BookingPriceEstimate
              spaceCost={estimateResult.spaceCost}
              addonsCost={estimateResult.addonsCost}
              totalAmount={estimateResult.totalAmount}
              loading={estimateLoading}
              duration={duration}
              selectedAddonsList={selectedAddonsList}
              addonServices={addonServices}
              spaceAssets={spaceAssets}
              assetId={assetId}
              layoutId={layoutId}
            />
          </div>
        )}

        {/* SECTION 7: Booking Actions / Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <Button 
            type="button" 
            onClick={(e) => handleFormSubmit(e, true)} 
            disabled={isPast || estimateLoading || submittingPayNow || submittingPayLater} 
            style={{ 
              backgroundColor: 'var(--accent-color)', 
              color: 'white', 
              opacity: isPast ? 0.5 : 1, 
              cursor: isPast ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              padding: '14px 20px',
              fontSize: '0.95rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {submittingPayNow ? '⏳ Đang xử lý...' : '💳 Thanh toán đặt trước & Đặt chỗ'}
          </Button>

          <Button 
            type="button" 
            onClick={(e) => handleFormSubmit(e, false)} 
            disabled={isPast || estimateLoading || submittingPayNow || submittingPayLater} 
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--primary-text)',
              border: '1px solid var(--border-color)',
              opacity: isPast ? 0.5 : 1, 
              cursor: isPast ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              padding: '12px 20px',
              fontSize: '0.9rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {submittingPayLater ? '⏳ Đang lưu...' : '💾 Đặt chỗ (Thanh toán sau)'}
          </Button>
        </div>

        {isPast && (
          <div style={{ color: '#e07a5f', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold', textAlign: 'center' }}>
            ⚠️ Thời gian đặt chỗ không được ở quá khứ.
          </div>
        )}
      </form>

      {/* Addons Selection Popup Modal */}
      <AddonsModal
        isOpen={isAddonsModalOpen}
        onClose={() => setIsAddonsModalOpen(false)}
        addonServices={addonServices}
        selectedQuantities={selectedQuantities}
        onQuantityChange={handleQuantityChange}
      />
    </div>
  );
};
