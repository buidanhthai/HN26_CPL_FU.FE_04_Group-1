import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/Button';

interface SpaceAsset {
  id: number;
  assetName: string;
  assetType: string;
  capacity: number;
  basePrice: number;
  isActive: boolean;
}

const SpaceAssets: React.FC = () => {
  const [assets, setAssets] = useState<SpaceAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('HotDesk');
  const [capacity, setCapacity] = useState(1);
  const [basePrice, setBasePrice] = useState(0);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get<SpaceAsset[]>('/space-assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<SpaceAsset>('/space-assets', {
        assetName,
        assetType,
        capacity,
        basePrice
      });
      setAssets([...assets, res.data]);
      setAssetName('');
      setCapacity(1);
      setBasePrice(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/space-assets/${id}`);
      setAssets(assets.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Quản lý Tài sản & Không gian
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Back-Office: Thêm, sửa, xóa các phòng họp và không gian làm việc.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
        {/* Assets List */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Danh sách Không gian
          </h2>

          {loading ? (
            <p style={{ color: 'var(--secondary-text)' }}>Đang tải dữ liệu...</p>
          ) : assets.length === 0 ? (
            <p style={{ color: 'var(--secondary-text)' }}>Chưa có tài sản nào.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--primary-text)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--secondary-text)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px 8px' }}>Tên Không gian</th>
                  <th style={{ padding: '12px 8px' }}>Loại</th>
                  <th style={{ padding: '12px 8px' }}>Sức chứa</th>
                  <th style={{ padding: '12px 8px' }}>Giá/Giờ</th>
                  <th style={{ padding: '12px 8px' }}>Trạng thái</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '14px 8px', fontWeight: '600' }}>{a.assetName}</td>
                    <td style={{ padding: '14px 8px' }}>{a.assetType}</td>
                    <td style={{ padding: '14px 8px' }}>{a.capacity}</td>
                    <td style={{ padding: '14px 8px' }}>{(a.basePrice ?? 0).toLocaleString()}đ</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: a.isActive ? 'rgba(122, 134, 106, 0.15)' : 'rgba(212, 163, 115, 0.15)',
                        color: a.isActive ? 'var(--nature-accent)' : 'var(--accent-color)'
                      }}>
                        {a.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(a.id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Asset Form */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '30px 24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 20px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Thêm Không gian mới
          </h2>
          
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Tên Không gian</label>
              <input 
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="VD: Phòng họp A"
                className="input-field"
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Loại</label>
              <select 
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="input-field"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              >
                <option value="HotDesk">Hot Desk</option>
                <option value="MeetingRoom">Phòng họp</option>
                <option value="EventSpace">Không gian Sự kiện</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Sức chứa (Người)</label>
              <input 
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="input-field"
                min="1"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>Giá cơ bản (VNĐ/Giờ)</label>
              <input 
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="input-field"
                min="0"
              />
            </div>

            <Button type="submit" style={{ marginTop: '10px' }}>Tạo Không gian</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpaceAssets;
