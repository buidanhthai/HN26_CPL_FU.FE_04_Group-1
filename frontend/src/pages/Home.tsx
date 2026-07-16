import React, { useContext, useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import api from '../services/api';
import './Home.css';

interface AddonItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  desc: string;
  category: 'coffee' | 'tea' | 'utilities' | 'devices';
}

const enrichAddon = (service: any): AddonItem => {
  const name = service.serviceName || service.ServiceName || '';
  const price = service.unitPrice || service.UnitPrice || 0;
  const id = service.id || service.Id;
  const method = service.chargeMethod || service.ChargeMethod || 'Fixed';

  let category: 'coffee' | 'tea' | 'utilities' | 'devices' = 'coffee';
  let desc = 'Thức uống thơm ngon phục vụ tại quầy.';
  let unit = 'phần';

  const lowerName = name.toLowerCase();
  if (lowerName.includes('cà phê') || lowerName.includes('cafe') || lowerName.includes('bạc xỉu')) {
    category = 'coffee';
    desc = 'Cà phê được pha chế thơm ngon, đậm đà chuẩn vị.';
    unit = 'ly';
  } else if (lowerName.includes('trà')) {
    category = 'tea';
    desc = 'Trà thanh mát, giải nhiệt cho ngày dài làm việc.';
    unit = 'ly';
  } else if (lowerName.includes('bánh') || lowerName.includes('in ấn') || lowerName.includes('sao chụp') || lowerName.includes('croissant')) {
    category = 'utilities';
    desc = lowerName.includes('bánh') || lowerName.includes('croissant') ? 'Bánh ngọt tiếp năng lượng.' : 'Hỗ trợ in ấn tài liệu tốc độ cao.';
    unit = lowerName.includes('bánh') || lowerName.includes('croissant') ? 'phần' : 'trang';
  } else {
    category = 'devices';
    desc = `Thiết bị phục vụ công việc và hội thảo chuyên nghiệp.`;
    unit = method === 'By_Hour' ? 'giờ' : 'ngày';
  }

  return {
    id,
    name,
    price,
    unit,
    desc,
    category
  };
};

const Home: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);
  const spacesRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = authContext?.isAuthenticated ?? false;

  // States fetched from API
  const [addonServices, setAddonServices] = useState<AddonItem[]>([]);
  const [spaceAssets, setSpaceAssets] = useState<any[]>([]);

  // Active tab state for cafe menu
  const [activeMenuTab, setActiveMenuTab] = useState<'coffee' | 'tea' | 'utilities' | 'devices'>('coffee');

  // Calculator states
  const [calcSelectedRoomId, setCalcSelectedRoomId] = useState<number>(2);
  const [calcDuration, setCalcDuration] = useState<number>(2);
  const [calcSelectedAddons, setCalcSelectedAddons] = useState<number[]>([]);
  const [estimateResult, setEstimateResult] = useState({
    spaceCost: 0,
    addonsCost: 0,
    totalAmount: 0
  });

  // Fetch addon services and space assets on load
  useEffect(() => {
    bookingService.getAddOnServices()
      .then((data) => {
        const enriched = data.map(enrichAddon);
        setAddonServices(enriched);
      })
      .catch((err) => {
        console.error('Error fetching addon services:', err);
      });

    api.get<any[]>('/space-assets')
      .then((res) => {
        setSpaceAssets(res.data);
        if (res.data.length > 0) {
          const defaultRoom = res.data.find((a: any) => a.id === 2) || res.data[0];
          setCalcSelectedRoomId(defaultRoom.id || defaultRoom.Id);
        }
      })
      .catch((err) => {
        console.error('Error fetching space assets:', err);
      });
  }, []);

  // Calculate dynamic price estimate from Backend API
  useEffect(() => {
    if (!calcSelectedRoomId) return;
    bookingService.calculateEstimate(calcSelectedRoomId, 0, calcDuration, calcSelectedAddons)
      .then((res) => {
        setEstimateResult({
          spaceCost: res.spaceCost || res.SpaceCost || 0,
          addonsCost: res.addonsCost || res.AddonsCost || 0,
          totalAmount: res.totalAmount || res.TotalAmount || 0
        });
      })
      .catch((err) => {
        console.error('Error calling calculateEstimate:', err);
      });
  }, [calcSelectedRoomId, calcDuration, calcSelectedAddons]);

  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleActionClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleAddonToggle = (id: number) => {
    if (calcSelectedAddons.includes(id)) {
      setCalcSelectedAddons(calcSelectedAddons.filter(item => item !== id));
    } else {
      setCalcSelectedAddons([...calcSelectedAddons, id]);
    }
  };

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav>
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>CozySpace.</div>
        <ul className="nav-links">
          <li>
            <button className="nav-link-btn" onClick={() => scrollToSection(spacesRef)}>
              Tìm không gian
            </button>
          </li>
          <li>
            <button className="nav-link-btn" onClick={() => scrollToSection(menuRef)}>
              Menu Cafe & Add-ons
            </button>
          </li>
          <li>
            <button className="nav-link-btn" onClick={() => scrollToSection(calcRef)}>
              Tính giá đặt chỗ
            </button>
          </li>
          <li>
            <button className="nav-link-btn" onClick={handleActionClick}>
              Lịch đặt của tôi
            </button>
          </li>
        </ul>
        <div className="user-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-login">
                Bảng điều khiển
              </Link>
              <button onClick={authContext?.logout} className="btn-primary" style={{ backgroundColor: '#e07a5f' }}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Đăng nhập
              </Link>
              <button onClick={() => navigate('/register')} className="btn-primary">
                Đặt chỗ ngay
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO & SEARCH BAR */}
      <section className="hero">
        <h1>
          Không Gian Làm Việc On-Demand
          <br />
          Đậm Chất "Chill" Cafe
        </h1>
        <p>
          Giải tỏa cô lập xã hội, tái lập ranh giới làm việc hiệu quả với mô hình đặt chỗ ngắn hạn linh hoạt, phục vụ đồ uống chuẩn gu và thiết bị hậu cần post-paid tiện dụng.
        </p>

        {/* SEARCH FILTER BAR */}
        <div className="search-container" ref={searchRef}>
          <div className="search-group">
            <label>Loại không gian</label>
            <select defaultValue="desk">
              <option value="desk">Chỗ ngồi cá nhân</option>
              <option value="meeting">Phòng họp riêng</option>
              <option value="office">Văn phòng cố định</option>
            </select>
          </div>
          <div className="search-group">
            <label>Ngày đặt</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="search-group">
            <label>Khung giờ</label>
            <select defaultValue="all-day">
              <option value="morning">08:00 - 12:00</option>
              <option value="afternoon">13:00 - 17:00</option>
              <option value="all-day">Cả ngày</option>
            </select>
          </div>
          <div className="search-group">
            <label>Sức chứa</label>
            <select defaultValue="1">
              <option value="1">1 người</option>
              <option value="small">2 - 5 người</option>
              <option value="medium">6 - 15 người</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleActionClick}>
            Kiểm tra phòng trống
          </button>
        </div>
      </section>

      {/* ASSETS LISTING */}
      <section className="spaces-section" ref={spacesRef}>
        <div className="section-header">
          <h2>Không gian sẵn sàng phục vụ</h2>
          <p>Khám phá các lựa chọn chỗ ngồi và phòng họp đối xứng hoàn hảo với nhu cầu của bạn.</p>
        </div>

        <div className="spaces-grid">
          {spaceAssets.slice(0, 3).map((asset) => {
            const isMeeting = asset.assetType === 'Meeting_Room';
            const icon = isMeeting ? '🤝' : '💻';
            return (
              <div className="space-card" key={asset.id}>
                <div className="space-img-mock">
                  {icon}
                  <span className="space-tag">Sức chứa: {asset.capacity} người</span>
                </div>
                <div className="space-content">
                  <h3>{asset.assetName}</h3>
                  <p className="space-desc">
                    {asset.description || `Không gian làm việc ${asset.assetType === 'Hot_Desk' ? 'cá nhân' : 'phòng họp'} tại ${asset.locationName}, thiết kế hiện đại, đầy đủ thiết bị và nước uống.`}
                  </p>
                  <div className="space-meta">
                    <div className="space-price">
                      {asset.basePrice.toLocaleString('vi-VN')}đ <span>/ giờ</span>
                    </div>
                    <button className="btn-card" onClick={handleActionClick}>
                      Chọn vị trí
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CAFE & ADD-ON SERVICES MENU */}
      <section className="menu-section" ref={menuRef}>
        <div className="section-header">
          <h2>Danh mục đồ uống & Dịch vụ đi kèm</h2>
          <p>Danh mục dịch vụ phong phú được đồng bộ trực tiếp từ bảng giá hệ thống để phục vụ bạn tốt nhất.</p>
        </div>

        {/* Tab Buttons */}
        <div className="menu-tabs">
          <button 
            className={`menu-tab-btn ${activeMenuTab === 'coffee' ? 'active' : ''}`}
            onClick={() => setActiveMenuTab('coffee')}
          >
            ☕ Cà phê
          </button>
          <button 
            className={`menu-tab-btn ${activeMenuTab === 'tea' ? 'active' : ''}`}
            onClick={() => setActiveMenuTab('tea')}
          >
            🍹 Trà & Sinh tố
          </button>
          <button 
            className={`menu-tab-btn ${activeMenuTab === 'utilities' ? 'active' : ''}`}
            onClick={() => setActiveMenuTab('utilities')}
          >
            🥪 Đồ ăn & Tiện ích
          </button>
          <button 
            className={`menu-tab-btn ${activeMenuTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveMenuTab('devices')}
          >
            🛠️ Thiết bị & Nhân sự
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="menu-grid">
          {addonServices.filter(item => item.category === activeMenuTab).map(item => (
            <div className="menu-item" key={item.id}>
              <div className="menu-item-info">
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
              </div>
              <div className="menu-item-price">
                {item.price.toLocaleString('vi-VN')}đ
                <span>/ {item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW STEPS (POST-PAID EXPLANATION) */}
      <section className="flow-section">
        <div className="section-header">
          <h2>Gọi thêm tại quầy - Thanh toán một lần</h2>
          <p>Quy trình phục vụ linh hoạt giúp bạn hoàn toàn tập trung vào công việc mà không lo gián đoạn.</p>
        </div>

        <div className="flow-grid">
          {/* Bước 1 */}
          <div className="flow-card">
            <span className="flow-badge">1</span>
            <span className="flow-icon">📱</span>
            <h3>Đặt chỗ & Nhận bàn</h3>
            <p>Chọn loại chỗ làm việc trực tuyến và thanh toán phí giữ chỗ cơ bản. Đến CozySpace quét mã QR nhận bàn.</p>
          </div>

          {/* Bước 2 */}
          <div className="flow-card">
            <span className="flow-badge">2</span>
            <span className="flow-icon">☕</span>
            <h3>Đặt thêm trong phiên</h3>
            <p>Trong lúc làm việc, chỉ cần quét mã QR tại bàn để gọi thêm nước, đồ ăn nhẹ hoặc mượn máy chiếu. Dịch vụ tự động ghi nhận vào hóa đơn tạm tính.</p>
          </div>

          {/* Bước 3 */}
          <div className="flow-card">
            <span className="flow-badge">3</span>
            <span className="flow-icon">💳</span>
            <h3>Thanh toán khi ra về</h3>
            <p>Khi kết thúc phiên làm việc, khách hàng kiểm tra lại danh sách dịch vụ phát sinh và thực hiện thanh toán tổng hợp một lần duy nhất.</p>
          </div>
        </div>
      </section>

      {/* DYNAMIC COST CALCULATOR */}
      <section className="calculator-section" ref={calcRef}>
        <div className="section-header">
          <h2>Mô phỏng & Ước tính chi phí đặt chỗ</h2>
          <p>Lên kế hoạch trước ngân sách của bạn bằng cách chọn loại chỗ ngồi, số giờ và các đồ dùng đi kèm.</p>
        </div>

        <div className="calculator-container">
          {/* Cấu hình tính giá */}
          <div className="calc-form">
            <h3>Cấu hình buổi làm việc</h3>
            
            {/* Chọn phòng làm việc từ database */}
            <div className="calc-group">
              <label>Không gian làm việc</label>
              <select 
                value={calcSelectedRoomId} 
                onChange={(e) => setCalcSelectedRoomId(Number(e.target.value))}
                className="form-select"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--surface-color)', 
                  color: 'var(--primary-text)', 
                  fontWeight: '600' 
                }}
              >
                {spaceAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetName} ({asset.locationName}) - {asset.basePrice.toLocaleString('vi-VN')}đ/giờ
                  </option>
                ))}
              </select>
            </div>

            {/* Thời gian */}
            <div className="calc-group">
              <label>Thời lượng sử dụng (giờ)</label>
              <div className="calc-duration-input">
                <input 
                  type="number" 
                  min="1"
                  max={24}
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <span>giờ làm việc</span>
              </div>
            </div>

            {/* Chọn Addons kèm theo */}
            <div className="calc-group">
              <label>Thêm dịch vụ & Đồ uống kèm theo</label>
              <div className="calc-addons-list">
                {addonServices.map(service => (
                  <div 
                    className={`calc-addon-item ${calcSelectedAddons.includes(service.id) ? 'active' : ''}`}
                    key={service.id}
                    onClick={() => handleAddonToggle(service.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={calcSelectedAddons.includes(service.id)}
                      onChange={() => {}}
                    />
                    <span>{service.name}</span>
                    <em>+{service.price.toLocaleString('vi-VN')}đ</em>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bảng tóm tắt kết quả */}
          <div className="calc-summary">
            <div>
              <h3>Hóa đơn ước tính</h3>
              <ul className="calc-breakdown">
                <li className="calc-breakdown-item">
                  <span>
                    Chi phí không gian ({calcDuration} giờ)
                  </span>
                  <strong>{estimateResult.spaceCost.toLocaleString('vi-VN')}đ</strong>
                </li>
                
                {calcSelectedAddons.map(id => {
                  const item = addonServices.find(s => s.id === id);
                  if (!item) return null;
                  
                  return (
                    <li className="calc-breakdown-item" key={item.id}>
                      <span>
                        + {item.name}
                      </span>
                      <strong>{item.price.toLocaleString('vi-VN')}đ</strong>
                    </li>
                  );
                })}

                <li className="calc-breakdown-item total">
                  <span>Tổng cộng ước tính</span>
                  <span>{estimateResult.totalAmount.toLocaleString('vi-VN')}đ</span>
                </li>
              </ul>
            </div>

            <button className="calc-btn-book" onClick={handleActionClick}>
              Đăng ký đặt chỗ ngay
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
