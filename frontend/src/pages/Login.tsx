import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../services/api';
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00e1d9', margin: '0 0 10px 0' }}>Login</h2>
      <p style={{ textAlign: 'center', color: '#a2a5b9', fontSize: '0.85rem', marginBottom: '24px' }}>
        Enter credentials to access your dashboard
      </p>

      {error && (
        <div style={{
          backgroundColor: 'rgba(255, 92, 117, 0.15)',
          color: '#ff5c75',
          border: '1px solid #ff5c75',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '15px',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.85rem', color: '#a2a5b9' }}>Địa chỉ Email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="example@gmail.com"
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #2d2d3f',
              backgroundColor: '#1c1c28',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.85rem', color: '#a2a5b9' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #2d2d3f',
              backgroundColor: '#1c1c28',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        <Button type="submit" disabled={loading} style={{ marginTop: '10px', width: '100%' }}>
          {loading ? 'Logging in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
