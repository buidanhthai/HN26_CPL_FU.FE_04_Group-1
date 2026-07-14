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
      <h1 className="page-title">
        Quản lý Tài sản & Không gian
      </h1>
      <p className="page-desc">
        Back-Office: Thêm, sửa, xóa các phòng họp và không gian làm việc.
      </p>

      <div className="layout-grid-sidebar">
        {/* Assets List */}
        <div className="panel-card">
          <h2 className="panel-title">
            Danh sách Không gian
          </h2>

          {loading ? (
            <p className="page-desc">Đang tải dữ liệu...</p>
          ) : assets.length === 0 ? (
            <p className="page-desc">Chưa có tài sản nào.</p>
          ) : (
            <div className="table-container">
              <table className="theme-table">
                <thead>
                  <tr className="theme-tr-head">
                    <th className="theme-th">Tên Không gian</th>
                    <th className="theme-th">Loại</th>
                    <th className="theme-th">Sức chứa</th>
                    <th className="theme-th">Giá/Giờ</th>
                    <th className="theme-th">Trạng thái</th>
                    <th className="theme-th" style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id} className="theme-tr-body">
                      <td className="theme-td" style={{ fontWeight: '600' }}>{a.assetName}</td>
                      <td className="theme-td">{a.assetType}</td>
                      <td className="theme-td">{a.capacity}</td>
                      <td className="theme-td">{(a.basePrice ?? 0).toLocaleString()}đ</td>
                      <td className="theme-td">
                        <span className={`badge ${a.isActive ? 'badge-completed' : 'badge-unassigned'}`}>
                          {a.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="theme-td" style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(a.id)}
                          className="btn-link-danger"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Asset Form */}
        <div className="panel-card">
          <h2 className="panel-title">
            Thêm Không gian mới
          </h2>
          
          <form onSubmit={handleCreate} className="form-container">
            <div className="form-group">
              <label className="form-label">Tên Không gian</label>
              <input 
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="VD: Phòng họp A"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Loại</label>
              <select 
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="form-select"
              >
                <option value="HotDesk">Hot Desk</option>
                <option value="MeetingRoom">Phòng họp</option>
                <option value="EventSpace">Không gian Sự kiện</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sức chứa (Người)</label>
              <input 
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="form-input"
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá cơ bản (VNĐ/Giờ)</label>
              <input 
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="form-input"
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
