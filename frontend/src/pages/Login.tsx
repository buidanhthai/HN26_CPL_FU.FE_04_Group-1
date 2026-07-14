import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!auth) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      setError('');
      setLoading(true);

      // Gọi hàm đăng nhập thông qua authService đã được import ở trên
      const userData = await authService.login({ username, password });
      auth.login(userData);
      navigate('/');

    } catch (err: any) {
      console.error(err);
      // Fallback for testing frontend before backend is fully running
      if (err.code === 'ERR_NETWORK') {
        console.warn('Backend is offline. Logging in with mock credentials.');
        auth.login({
          id: 1,
          fullName: username,
          email: `${username}@example.com`,
          role: 'ADMIN',
          token: 'mock-jwt-token'
        });
        navigate('/');
      } else {
        setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="panel-title" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '8px' }}>
        Đăng nhập
      </h2>
      <p className="page-desc" style={{ textAlign: 'center' }}>
        Nhập thông tin tài khoản để truy cập hệ thống
      </p>

      {error && (
        <div className="badge-unassigned" style={{ display: 'block', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="form-container">
        <div className="form-group">
          <label className="form-label">
            Tài khoản / Email
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tài khoản hoặc email..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="form-input"
          />
        </div>

        <Button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="auth-footer">
        <span>Bạn chưa có tài khoản? </span>
        <Link to="/register" className="btn-link-primary">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default Login;
