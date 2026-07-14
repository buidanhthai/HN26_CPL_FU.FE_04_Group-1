import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import Button from '../components/Button';

const Profile: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (authContext?.user) {
      setFormData({
        fullName: authContext.user.fullName || '',
        phoneNumber: authContext.user.phoneNumber || '',
      });
    }
  }, [authContext?.user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await authService.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      });

      authContext?.updateUserContext(response.fullName, response.phoneNumber);
      setMessage({ text: 'Cập nhật hồ sơ thành công!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setMessage({ 
        text: error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ color: 'var(--primary-text)', marginBottom: '30px', fontFamily: 'var(--font-title)' }}>
        Hồ sơ cá nhân
      </h2>

      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? 'rgba(122, 134, 106, 0.12)' : 'rgba(224, 122, 95, 0.12)',
          color: message.type === 'success' ? 'var(--nature-accent)' : '#e07a5f',
          border: `1px solid ${message.type === 'success' ? 'rgba(122, 134, 106, 0.4)' : 'rgba(224, 122, 95, 0.4)'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: 'var(--secondary-text)' }}>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="input-field"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: 'var(--secondary-text)' }}>Số điện thoại</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input-field"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: 'var(--secondary-text)' }}>Email</label>
          <input
            type="email"
            value={authContext?.user?.email || ''}
            disabled
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              backgroundColor: '#f5f5f5',
              color: '#888',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: 'var(--secondary-text)' }}>Vai trò</label>
          <input
            type="text"
            value={authContext?.user?.role || ''}
            disabled
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              backgroundColor: '#f5f5f5',
              color: '#888',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <Button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
