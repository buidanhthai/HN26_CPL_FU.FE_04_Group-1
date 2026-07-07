import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user } = auth;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
        Bảng điều khiển
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Chào mừng quay trở lại không gian làm việc của bạn.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '35px'
      }}>
        {/* Card 1 */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          transition: 'var(--transition)'
        }} className="hover-lift">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--secondary-text)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Phiên làm việc hiện tại
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Đang hoạt động
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--nature-accent)', fontWeight: '600' }}>
            Tài khoản: {user?.username} ({user?.role})
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          transition: 'var(--transition)'
        }} className="hover-lift">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--secondary-text)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Trạng thái đặt chỗ
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            5 Chờ duyệt
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            Lịch tiếp theo: Ngày mai lúc 10:00 sáng
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          transition: 'var(--transition)'
        }} className="hover-lift">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--secondary-text)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tiến độ công việc
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
            Hoàn thành 80%
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--nature-accent)', fontWeight: '600' }}>
            4 công việc đã xong hôm nay
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--surface-color)',
        padding: '30px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ fontSize: '1.4rem', margin: '0 0 15px 0', color: 'var(--primary-text)', fontFamily: 'var(--font-title)' }}>
          Hệ thống đặt chỗ Cozy Space
        </h2>
        <p style={{ margin: '0 0 15px 0', color: 'var(--secondary-text)', fontSize: '0.95rem', lineHeight: '1.7' }}>
          Chào mừng đến với Cozy Space. Hệ thống đặt chỗ làm việc on-demand được thiết kế đậm chất chill cafe, hỗ trợ tối đa việc tập trung làm việc linh hoạt, giảm thiểu cô lập xã hội. Bạn có thể dễ dàng quản lý lịch hẹn (Bookings) và công việc hàng ngày (Tasks) ngay trên thanh điều hướng bên trái.
        </p>
        <p style={{ margin: '0', color: 'var(--secondary-text)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Sử dụng các menu <strong>Lịch đặt chỗ</strong> hoặc <strong>Công việc của tôi</strong> trên thanh menu để bắt đầu trải nghiệm dịch vụ.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
