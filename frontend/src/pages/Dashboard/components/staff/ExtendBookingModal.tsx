import React, { useState } from 'react';
import api from '../../../../services/api';

interface ExtendBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number | null;
  onSuccess: () => void;
}

export const ExtendBookingModal: React.FC<ExtendBookingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  onSuccess,
}) => {
  const [minutes, setMinutes] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !bookingId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes <= 0) {
      setError('Số phút gia hạn phải lớn hơn 0.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/bookings/${bookingId}/extend`, { minutes });
      alert('Gia hạn phòng thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gia hạn phòng. Vui lòng kiểm tra xung đột khung giờ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="panel-card"
        style={{
          width: '90%',
          maxWidth: '450px',
          backgroundColor: '#201815',
          border: '1px solid var(--border-color)',
          padding: '24px',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="text-xl font-serif text-white m-0">⏰ Gia Hạn Thời Gian Đặt Phòng</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--secondary-text)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={{
            color: '#e07a5f',
            fontSize: '0.85rem',
            marginBottom: '15px',
            fontWeight: '500',
            backgroundColor: 'rgba(224, 122, 95, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(224, 122, 95, 0.3)'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label text-stone-300">Chọn khoảng thời gian gia hạn</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              {[30, 60, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setMinutes(mins)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${minutes === mins ? 'var(--nature-accent)' : 'var(--border-color)'}`,
                    backgroundColor: minutes === mins ? 'rgba(212,163,115,0.12)' : 'var(--surface-color)',
                    color: minutes === mins ? 'var(--nature-accent)' : 'var(--secondary-text)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  +{mins} phút
                </button>
              ))}
            </div>

            <label className="form-label text-stone-300">Hoặc nhập số phút tùy chỉnh</label>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="form-input"
              style={{ backgroundColor: 'var(--surface-color)', color: 'white' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px', fontWeight: 'bold' }}
            >
              {submitting ? 'Đang gửi...' : 'Xác nhận gia hạn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
