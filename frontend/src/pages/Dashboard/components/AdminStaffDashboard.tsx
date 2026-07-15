import React from 'react';
import { Link } from 'react-router-dom';

interface AdminStaffDashboardProps {
  userFullName: string;
  userRole: string;
}

const AdminStaffDashboard: React.FC<AdminStaffDashboardProps> = ({ userFullName, userRole }) => {
  return (
    <div>
      <h1
        style={{
          fontSize: '2rem',
          margin: '0 0 8px 0',
          color: 'var(--primary-text)',
          fontFamily: 'var(--font-title)',
        }}
      >
        Bảng điều khiển
      </h1>
      <p style={{ color: 'var(--secondary-text)', margin: '0 0 30px 0', fontSize: '0.95rem' }}>
        Chào mừng quay trở lại không gian làm việc của bạn.
      </p>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '35px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow)',
            transition: 'var(--transition)',
          }}
          className="hover-lift"
        >
          <h3
            style={{
              margin: '0 0 10px 0',
              color: 'var(--secondary-text)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Phiên làm việc hiện tại
          </h3>
          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: 'var(--primary-text)',
              fontFamily: 'var(--font-title)',
            }}
          >
            Đang hoạt động
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--nature-accent)', fontWeight: '600' }}>
            Tài khoản: {userFullName} ({userRole})
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow)',
            transition: 'var(--transition)',
          }}
          className="hover-lift"
        >
          <h3
            style={{
              margin: '0 0 10px 0',
              color: 'var(--secondary-text)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Trạng thái đặt chỗ
          </h3>
          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: 'var(--primary-text)',
              fontFamily: 'var(--font-title)',
            }}
          >
            Chờ xử lý
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            Lịch tiếp theo: Ngày mai lúc 10:00 sáng
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow)',
            transition: 'var(--transition)',
          }}
          className="hover-lift"
        >
          <h3
            style={{
              margin: '0 0 10px 0',
              color: 'var(--secondary-text)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Tiến độ công việc
          </h3>
          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: 'var(--primary-text)',
              fontFamily: 'var(--font-title)',
            }}
          >
            Đang vận hành
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--nature-accent)', fontWeight: '600' }}>
            Hệ thống đặt chỗ Cozy Space
          </div>
        </div>
      </div>

      {/* Welcome Info Card */}
      <div
        style={{
          backgroundColor: 'var(--surface-color)',
          padding: '30px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            margin: '0 0 15px 0',
            color: 'var(--primary-text)',
            fontFamily: 'var(--font-title)',
          }}
        >
          Hệ thống đặt chỗ Cozy Space
        </h2>
        <p
          style={{
            margin: '0 0 15px 0',
            color: 'var(--secondary-text)',
            fontSize: '0.95rem',
            lineHeight: '1.7',
          }}
        >
          Chào mừng đến với Cozy Space. Hệ thống đặt chỗ làm việc on-demand được thiết kế đậm
          chất chill cafe, hỗ trợ tối đa việc tập trung làm việc linh hoạt, giảm thiểu cô lập xã
          hội. Bạn có thể dễ dàng quản lý lịch hẹn (Bookings) và công việc hàng ngày (Tasks) ngay
          trên thanh điều hướng bên trái.
        </p>
        <p style={{ margin: '0', color: 'var(--secondary-text)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Sử dụng các menu <strong>Lịch đặt chỗ</strong> hoặc{' '}
          <strong>Công việc của tôi</strong> trên thanh menu để bắt đầu trải nghiệm dịch vụ.
        </p>
      </div>

      {/* Admin Panel (only for ADMIN role) */}
      {userRole === 'ADMIN' && (
        <div
          style={{
            backgroundColor: 'rgba(212, 163, 115, 0.1)',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid rgba(212, 163, 115, 0.3)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <h2
            style={{
              fontSize: '1.4rem',
              margin: '0 0 15px 0',
              color: 'var(--primary-text)',
              fontFamily: 'var(--font-title)',
            }}
          >
            Quản trị viên (Admin Panel)
          </h2>
          <p
            style={{
              margin: '0 0 15px 0',
              color: 'var(--secondary-text)',
              fontSize: '0.95rem',
              lineHeight: '1.7',
            }}
          >
            Khu vực dành riêng cho Quản trị viên để quản lý toàn bộ hệ thống. Background service
            tự động hủy lịch chưa thanh toán sau 10 phút đang hoạt động.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link
              to="/space-assets"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
              className="hover-lift"
            >
              Quản lý Tài sản (Space Assets)
            </Link>
            <button
              style={{
                backgroundColor: 'var(--surface-color)',
                color: 'var(--primary-text)',
                border: '1px solid var(--border-color)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
              onClick={() => alert('Chức năng Báo cáo doanh thu đang được phát triển.')}
            >
              Báo cáo Doanh thu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffDashboard;
