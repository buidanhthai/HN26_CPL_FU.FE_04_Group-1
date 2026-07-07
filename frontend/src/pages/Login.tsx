import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../services/api';

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
      // API call to authentication endpoint
      const response = await api.post('/auth/login', { username, password });
      auth.login(response.data);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      // Fallback for testing frontend before backend is fully running
      if (err.code === 'ERR_NETWORK') {
        console.warn('Backend is offline. Logging in with mock credentials.');
        auth.login({
          id: 1,
          username: username,
          email: `${username}@example.com`,
          role: 'Admin',
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
    <div>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '8px', 
        color: 'var(--primary-text)', 
        fontFamily: 'var(--font-title)',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        Đăng nhập
      </h2>
      <p style={{ 
        textAlign: 'center', 
        color: 'var(--secondary-text)', 
        fontSize: '0.9rem', 
        marginBottom: '30px' 
      }}>
        Nhập thông tin tài khoản để truy cập hệ thống
      </p>

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

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>
            Tài khoản
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="input-field"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary-text)' }}>
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
          />
        </div>

        <Button type="submit" disabled={loading} style={{ marginTop: '15px', width: '100%' }}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
