import React, { useState } from 'react';
import api from '../../../../services/api';
import { SwitchRoomForm } from './SwitchRoomForm';

interface SwitchRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number | null;
  currentAssetId: number | null;
  spaceAssets: any[];
  onSuccess: () => void;
}

export const SwitchRoomModal: React.FC<SwitchRoomModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  currentAssetId,
  spaceAssets,
  onSuccess,
}) => {
  const [newAssetId, setNewAssetId] = useState<number | ''>('');
  const [newLayoutId, setNewLayoutId] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !bookingId) return null;

  const availableAssets = spaceAssets.filter(
    (a) => a.id !== currentAssetId && !a.isMaintenance && a.status !== 'Maintenance'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetId) {
      setError('Vui lòng chọn không gian mới.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/bookings/${bookingId}/switch-asset`, {
        newAssetId: Number(newAssetId),
        newLayoutId,
      });
      alert('Chuyển phòng thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể chuyển không gian. Vui lòng kiểm tra xung đột lịch đặt.');
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
          maxWidth: '480px',
          backgroundColor: '#201815',
          border: '1px solid var(--border-color)',
          padding: '24px',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="text-xl font-serif text-white m-0">🔄 Chuyển Không Gian/Phòng Họp</h3>
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

        <SwitchRoomForm
          newAssetId={newAssetId}
          setNewAssetId={setNewAssetId}
          newLayoutId={newLayoutId}
          setNewLayoutId={setNewLayoutId}
          availableAssets={availableAssets}
          submitting={submitting}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
export default SwitchRoomModal;
