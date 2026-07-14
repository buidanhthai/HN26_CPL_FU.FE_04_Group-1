import React, { useContext, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

interface AddonItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  desc: string;
  category: 'coffee' | 'tea' | 'utilities' | 'devices';
}

const ADDON_SERVICES: AddonItem[] = [
  // Cà phê
  { id: 1, name: 'Cà phê Đen đá / Nóng', price: 25000, unit: 'ly', desc: 'Cà phê phin truyền thống đậm đà.', category: 'coffee' },
  { id: 2, name: 'Cà phê Sữa đá / Nóng', price: 29000, unit: 'ly', desc: 'Sự kết hợp hoàn hảo giữa sữa đặc và cafe.', category: 'coffee' },
  { id: 3, name: 'Bạc xỉu đá', price: 32000, unit: 'ly', desc: 'Thức uống ngọt ngào được nhiều sinh viên ưa chuộng.', category: 'coffee' },
  { id: 4, name: 'Americano đá', price: 30000, unit: 'ly', desc: 'Cà phê pha máy nhẹ nhàng, hậu vị sạch.', category: 'coffee' },
  { id: 5, name: 'Cà phê Muối', price: 35000, unit: 'ly', desc: 'Món trendy với lớp kem muối mặn béo ngậy.', category: 'coffee' },
  { id: 6, name: 'Cà phê Latte / Cappuccino', price: 39000, unit: 'ly', desc: 'Đánh sữa mịn chuẩn gu máy Ý.', category: 'coffee' },
  // Trà & Thức uống
  { id: 7, name: 'Trà Lipton mật ong nóng', price: 25000, unit: 'ly', desc: 'Ấm áp, giải cảm hiệu quả cho ngày mưa.', category: 'tea' },
  { id: 8, name: 'Trà đào cam sả', price: 35000, unit: 'ly', desc: 'Giải nhiệt thanh mát kèm miếng đào giòn ngọt.', category: 'tea' },
  { id: 9, name: 'Trà dâu tằm Macchiato', price: 38000, unit: 'ly', desc: 'Vị dâu tằm chua ngọt hòa với foam sữa béo.', category: 'tea' },
  { id: 10, name: 'Nước cam nguyên chất', price: 35000, unit: 'ly', desc: 'Vắt tươi 100% cung cấp vitamin C dồi dào.', category: 'tea' },
  { id: 11, name: 'Sinh tố Bơ / Xoài', price: 42000, unit: 'ly', desc: 'Xay nhuyễn sánh mịn từ trái cây tươi.', category: 'tea' },
  // Đồ ăn nhẹ & Tiện ích
  { id: 12, name: 'Bánh mì kẹp thịt / Pate', price: 30000, unit: 'phần', desc: 'Bữa sáng nhanh gọn tiếp năng lượng làm việc.', category: 'utilities' },
  { id: 13, name: 'Bánh ngọt Teabreak (Khay)', price: 150000, unit: 'khay', desc: 'Các loại bánh ngọt finger-food cho họp nhóm.', category: 'utilities' },
  { id: 14, name: 'Nước suối chai 500ml', price: 15000, unit: 'chai', desc: 'Nước suối Aquafina mát lạnh.', category: 'utilities' },
  { id: 15, name: 'Dịch vụ in ấn / Photocopy', price: 2000, unit: 'trang', desc: 'Hỗ trợ in tài liệu tốc độ cao tại quầy.', category: 'utilities' },
  // Thiết bị & Nhân sự
  { id: 16, name: 'Máy chiếu & Màn chiếu', price: 50000, unit: 'giờ', desc: 'Hỗ trợ kết nối HDMI/Type-C sắc nét.', category: 'devices' },
  { id: 17, name: 'Loa kéo & 2 micro không dây', price: 60000, unit: 'giờ', desc: 'Thích hợp cho workshop, thuyết trình.', category: 'devices' },
  { id: 18, name: 'Bảng Flipchart & Bút vẽ', price: 80000, unit: 'ngày', desc: 'Brainstorm ý tưởng tuyệt vời cùng đồng đội.', category: 'devices' },
  { id: 19, name: 'Kỹ thuật viên hỗ trợ', price: 120000, unit: 'giờ', desc: 'Có nhân viên túc trực set up kết nối suốt buổi.', category: 'devices' },
  { id: 20, name: 'Gói thiết kế layout phòng', price: 200000, unit: 'lần', desc: 'Nhân viên lễ tân sắp xếp phòng trước 15 phút.', category: 'devices' },
];

const Home: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);
  const spacesRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = authContext?.isAuthenticated ?? false;

  // Active tab state for cafe menu
  const [activeMenuTab, setActiveMenuTab] = useState<'coffee' | 'tea' | 'utilities' | 'devices'>('coffee');

  // Calculator states
  const [calcSpaceType, setCalcSpaceType] = useState<'desk' | 'dedicated' | 'meeting'>('desk');
  const [calcDuration, setCalcDuration] = useState<number>(2);
  const [calcSelectedAddons, setCalcSelectedAddons] = useState<number[]>([]);

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

  // Calculator calculation logic
  const getSpaceUnitPrice = () => {
    switch (calcSpaceType) {
      case 'desk':
        return { price: 25000, label: 'giờ' };
      case 'dedicated':
        return { price: 180000, label: 'ngày' };
      case 'meeting':
        return { price: 150000, label: 'giờ' };
    }
  };

  const calculateTotal = () => {
    const spaceUnit = getSpaceUnitPrice();
    const spaceCost = spaceUnit.price * calcDuration;

    const addonsCost = calcSelectedAddons.reduce((sum, id) => {
      const item = ADDON_SERVICES.find(s => s.id === id);
      if (!item) return sum;
      
      // Nếu là thiết bị tính theo giờ và loại phòng là theo giờ
      if (item.unit === 'giờ' && (calcSpaceType === 'desk' || calcSpaceType === 'meeting')) {
        return sum + item.price * calcDuration;
      }
      return sum + item.price;
    }, 0);

    return spaceCost + addonsCost;
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
          {/* Hot Desk */}
          <div className="space-card">
            <div className="space-img-mock">
              💻
              <span className="space-tag">Trống 12 chỗ</span>
            </div>
            <div className="space-content">
              <h3>Hot Desk (Chỗ Tự Do)</h3>
              <p className="space-desc">
                Chỗ ngồi làm việc cá nhân năng động, không gian thoáng đãng bên cửa sổ lớn ngập ánh nắng, tích hợp nước mát free.
              </p>
              <div className="space-meta">
                <div className="space-price">
                  25.000đ <span>/ giờ</span>
                </div>
                <button className="btn-card" onClick={handleActionClick}>
                  Chọn vị trí
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Desk */}
          <div className="space-card">
            <div className="space-img-mock">
              🖥️
              <span className="space-tag">Trống 4 chỗ</span>
            </div>
            <div className="space-content">
              <h3>Dedicated Desk (Chỗ Cố Định)</h3>
              <p className="space-desc">
                Không gian yên tĩnh tích hợp sẵn màn hình mở rộng Dell 24 inch, tủ khóa cá nhân bảo mật cho cả ngày làm việc.
              </p>
              <div className="space-meta">
                <div className="space-price">
                  180.000đ <span>/ ngày</span>
                </div>
                <button className="btn-card" onClick={handleActionClick}>
                  Chọn vị trí
                </button>
              </div>
            </div>
          </div>

          {/* Meeting Room */}
          <div className="space-card">
            <div className="space-img-mock">
              ☕
              <span className="space-tag">Hỗ trợ 6-15 người</span>
            </div>
            <div className="space-content">
              <h3>Phòng Họp Workshop</h3>
              <p className="space-desc">
                Tự do tùy biến Layout (chữ U, lớp học). Đầy đủ máy chiếu, bảng vẽ, hỗ trợ kỹ thuật viên và teabreak theo yêu cầu.
              </p>
              <div className="space-meta">
                <div className="space-price">
                  150.000đ <span>/ giờ</span>
                </div>
                <button className="btn-card" onClick={handleActionClick}>
                  Cấu hình & Đặt
                </button>
              </div>
            </div>
          </div>
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
          {ADDON_SERVICES.filter(item => item.category === activeMenuTab).map(item => (
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
            
            {/* Loại không gian */}
            <div className="calc-group">
              <label>Loại không gian làm việc</label>
              <div className="calc-type-select">
                <button 
                  className={`calc-type-btn ${calcSpaceType === 'desk' ? 'active' : ''}`}
                  onClick={() => { setCalcSpaceType('desk'); setCalcDuration(2); }}
                >
                  <span>💻</span>
                  <strong>Chỗ tự do</strong>
                  <p>25.000đ/giờ</p>
                </button>
                <button 
                  className={`calc-type-btn ${calcSpaceType === 'dedicated' ? 'active' : ''}`}
                  onClick={() => { setCalcSpaceType('dedicated'); setCalcDuration(1); }}
                >
                  <span>🖥️</span>
                  <strong>Chỗ cố định</strong>
                  <p>180.000đ/ngày</p>
                </button>
                <button 
                  className={`calc-type-btn ${calcSpaceType === 'meeting' ? 'active' : ''}`}
                  onClick={() => { setCalcSpaceType('meeting'); setCalcDuration(2); }}
                >
                  <span>🤝</span>
                  <strong>Phòng họp</strong>
                  <p>150.000đ/giờ</p>
                </button>
              </div>
            </div>

            {/* Thời gian */}
            <div className="calc-group">
              <label>Thời lượng sử dụng ({calcSpaceType === 'dedicated' ? 'ngày' : 'giờ'})</label>
              <div className="calc-duration-input">
                <input 
                  type="number" 
                  min="1"
                  max={calcSpaceType === 'dedicated' ? 30 : 24}
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <span>{calcSpaceType === 'dedicated' ? 'ngày' : 'giờ'} làm việc</span>
              </div>
            </div>

            {/* Chọn Addons kèm theo */}
            <div className="calc-group">
              <label>Thêm dịch vụ & Đồ uống kèm theo</label>
              <div className="calc-addons-list">
                {ADDON_SERVICES.map(service => (
                  <div 
                    className={`calc-addon-item ${calcSelectedAddons.includes(service.id) ? 'active' : ''}`}
                    key={service.id}
                    onClick={() => handleAddonToggle(service.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={calcSelectedAddons.includes(service.id)}
                      onChange={() => {}} // Handle click bằng thẻ cha để tăng diện tích bấm
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
                    {calcSpaceType === 'desk' ? 'Chỗ tự do' : calcSpaceType === 'dedicated' ? 'Chỗ cố định' : 'Phòng họp'} ({calcDuration} {calcSpaceType === 'dedicated' ? 'ngày' : 'giờ'})
                  </span>
                  <strong>{(getSpaceUnitPrice().price * calcDuration).toLocaleString('vi-VN')}đ</strong>
                </li>
                
                {calcSelectedAddons.map(id => {
                  const item = ADDON_SERVICES.find(s => s.id === id);
                  if (!item) return null;
                  
                  const isHourlyDevice = item.unit === 'giờ' && (calcSpaceType === 'desk' || calcSpaceType === 'meeting');
                  const itemTotal = isHourlyDevice ? item.price * calcDuration : item.price;

                  return (
                    <li className="calc-breakdown-item" key={item.id}>
                      <span>
                        + {item.name} {isHourlyDevice ? `(x${calcDuration}h)` : ''}
                      </span>
                      <strong>{itemTotal.toLocaleString('vi-VN')}đ</strong>
                    </li>
                  );
                })}

                <li className="calc-breakdown-item total">
                  <span>Tổng cộng ước tính</span>
                  <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
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
