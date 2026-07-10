import React, { useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);
  const spacesRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = authContext?.isAuthenticated ?? false;

  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement>) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleActionClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav>
        <div className="logo">CozySpace.</div>
        <ul className="nav-links">
          <li>
            <button className="nav-link-btn" onClick={() => scrollToSection(spacesRef)}>
              Tìm không gian
            </button>
          </li>
          <li>
            <button className="nav-link-btn" onClick={() => scrollToSection(spacesRef)}>
              Bảng giá linh hoạt
            </button>
          </li>
          <li>
            <button className="nav-link-btn" onClick={() => scrollToSection(servicesRef)}>
              Dịch vụ Add-on
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
              <Link to="/dashboard" className="btn-login" style={{ fontWeight: 600 }}>
                Bảng điều khiển
              </Link>
              <button onClick={authContext?.logout} className="btn-primary" style={{ backgroundColor: '#e07a5f', color: '#fff' }}>
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
          Giải tỏa cô lập xã hội, tái lập ranh giới làm việc hiệu quả với mô hình đặt chỗ ngắn hạn linh hoạt theo giờ và ngày.
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
            <input type="date" defaultValue="2026-07-10" />
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
          <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={handleActionClick}>
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
          {/* Loại 1: Hot Desk */}
          <div className="space-card">
            <div className="space-img-mock">
              💻
              <span className="space-tag">Trống 12 chỗ</span>
            </div>
            <div className="space-content">
              <h3>Hot Desk (Chỗ Tự Do)</h3>
              <p className="space-desc">
                Chỗ ngồi làm việc cá nhân năng động, không gian thoáng đãng bên cửa sổ lớn ngập ánh nắng.
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

          {/* Loại 2: Dedicated Desk */}
          <div className="space-card">
            <div className="space-img-mock">
              🖥️
              <span className="space-tag">Trống 4 chỗ</span>
            </div>
            <div className="space-content">
              <h3>Dedicated Desk (Chỗ Cố Định)</h3>
              <p className="space-desc">
                Không gian yên tĩnh tích hợp sẵn màn hình mở rộng, tủ cá nhân bảo mật cho cả ngày làm việc.
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

          {/* Loại 3: Meeting Room */}
          <div className="space-card">
            <div className="space-img-mock">
              ☕
              <span className="space-tag">Hỗ trợ 6-15 người</span>
            </div>
            <div className="space-content">
              <h3>Phòng Họp Workshop</h3>
              <p className="space-desc">
                Tự do tùy biến Layout (chữ U, lớp học, rạp hát). Đầy đủ máy chiếu, bảng vẽ, ánh sáng ấm áp.
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

      {/* ADD-ON SERVICES */}
      <section className="services-section" ref={servicesRef}>
        <div className="section-header">
          <h2>Dịch vụ đi kèm tiện ích</h2>
          <p>Tích hợp trực tiếp vào hóa đơn tổng hợp (Post-paid Folio) khi kết thúc phiên sử dụng.</p>
        </div>

        <div className="services-grid">
          <div className="service-item">
            <span className="service-icon">🍱</span>
            <h4>Gói Tiệc Trà (Teabreak)</h4>
            <p>Bánh ngọt finger-food, trái cây tươi kèm trà mạn suốt buổi họp.</p>
          </div>
          <div className="service-item">
            <span className="service-icon">☕</span>
            <h4>Quầy Cà Phê Moka</h4>
            <p>Phục vụ các tách Latte, Espresso chuẩn gu không giới hạn.</p>
          </div>
          <div className="service-item">
            <span className="service-icon">🖨️</span>
            <h4>Hậu Cần & In Ấn</h4>
            <p>Hỗ trợ in tài liệu trắng đen/màu tốc độ cao và văn phòng phẩm.</p>
          </div>
          <div className="service-item">
            <span className="service-icon">📐</span>
            <h4>Thiết Kế Sơ Đồ Layout</h4>
            <p>Nhân viên lễ tân sắp xếp bàn ghế trước giờ họp 15 phút theo yêu cầu.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
