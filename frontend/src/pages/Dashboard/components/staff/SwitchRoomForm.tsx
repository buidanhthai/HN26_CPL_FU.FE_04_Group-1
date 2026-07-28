import React from 'react';

interface SwitchRoomFormProps {
  newAssetId: number | '';
  setNewAssetId: (val: number | '') => void;
  newLayoutId: number;
  setNewLayoutId: (val: number) => void;
  availableAssets: any[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SwitchRoomForm: React.FC<SwitchRoomFormProps> = ({
  newAssetId,
  setNewAssetId,
  newLayoutId,
  setNewLayoutId,
  availableAssets,
  submitting,
  onClose,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label text-stone-300">Chọn không gian trống mới</label>
        <select
          value={newAssetId}
          onChange={(e) => setNewAssetId(e.target.value ? Number(e.target.value) : '')}
          className="form-input"
          style={{ backgroundColor: 'var(--surface-color)', color: 'white' }}
          required
        >
          <option value="">-- Chọn phòng họp / chỗ ngồi mới --</option>
          {availableAssets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.assetName} ({a.capacity} người - {a.basePrice?.toLocaleString('vi-VN')} VNĐ/h)
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label text-stone-300">Sơ đồ setup bàn ghế mới</label>
        <select
          value={newLayoutId}
          onChange={(e) => setNewLayoutId(Number(e.target.value))}
          className="form-input"
          style={{ backgroundColor: 'var(--surface-color)', color: 'white' }}
          required
        >
          <option value={1}>Sơ đồ dạng Thảo luận (Mặc định)</option>
          <option value={2}>Sơ đồ dạng Lớp học (+50K VNĐ/lượt)</option>
          <option value={3}>Sơ đồ dạng Hội thảo/U-Shape (+100K VNĐ/lượt)</option>
        </select>
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
          {submitting ? 'Đang chuyển...' : 'Xác nhận chuyển'}
        </button>
      </div>
    </form>
  );
};
