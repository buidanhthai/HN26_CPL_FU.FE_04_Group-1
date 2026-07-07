import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/Button';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Trạng thái dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Trạng thái xử lý lỗi và tải dữ liệu
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Xử lý thay đổi dữ liệu trong ô input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa thông báo lỗi khi người dùng bắt đầu gõ lại
    if (error) setError(null);
  };

  // Xử lý gửi Form đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { fullName, email, password, confirmPassword } = formData;

    // 1. Validation cơ bản ở phía Client
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường dữ liệu.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 2. Gọi API đăng ký qua authService
      const response = await authService.register({
        fullName,
        email,
        password,
      });

      setSuccess(response.message || 'Đăng ký tài khoản thành công!');
      
      // 3. Chuyển hướng sang trang Đăng nhập sau 2 giây thành công
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err);
      // Lấy câu thông báo lỗi trả về từ Backend (nếu có)
      const serverMessage = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký.';
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '8px', 
        color: 'var(--primary-text)', 
        fontFamily: 'var(--font-title)',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        Đăng ký
      </h2>
      <p style={{ 
        textAlign: 'center', 
        color: 'var(--secondary-text)', 
        fontSize: '0.9rem', 
        marginBottom: '30px' 
      }}>
        Tạo tài khoản mới để bắt đầu sử dụng hệ thống
      </p>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(224, 122, 95, 0.12)',
          color: '#e07a5f',
          border: '1px solid rgba(224, 122, 95, 0.4)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Thông báo thành công nếu có */}
      {success && (
        <div style={{
          backgroundColor: 'rgba(122, 134, 106, 0.12)',
          color: 'var(--nature-accent)',
          border: '1px solid rgba(122, 134, 106, 0.4)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          textAlign: 'center'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="fullName" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>
            Họ và tên
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={handleChange}
            className="input-field"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>
            Địa chỉ Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="example@company.com"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="confirmPassword" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          style={{ marginTop: '10px', width: '100%' }}
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
        </Button>
      </form>

      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '0.9rem',
        color: 'var(--secondary-text)'
      }}>
        <span>Bạn đã có tài khoản? </span>
        <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: '600', textDecoration: 'none' }}>
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};

export default Register;