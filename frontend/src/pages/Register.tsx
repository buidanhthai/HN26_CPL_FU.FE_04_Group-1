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
    <div className="auth-container">
      <h2 className="panel-title" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '8px' }}>
        Đăng ký
      </h2>
      <p className="page-desc" style={{ textAlign: 'center' }}>
        Tạo tài khoản mới để bắt đầu sử dụng hệ thống
      </p>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="badge-unassigned" style={{ display: 'block', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Thông báo thành công nếu có */}
      {success && (
        <div className="badge-completed" style={{ display: 'block', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Họ và tên
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={handleChange}
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Địa chỉ Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="example@company.com"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          style={{ marginTop: '10px' }}
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
        </Button>
      </form>

      <div className="auth-footer">
        <span>Bạn đã có tài khoản? </span>
        <Link to="/login" className="btn-link-primary">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};

export default Register;