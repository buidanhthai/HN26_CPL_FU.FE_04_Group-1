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
    <div className="profile-container">
      <h2 className="panel-title mb-6">
        Hồ sơ cá nhân
      </h2>

      {message.text && (
        <div className={`alert-box ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label className="form-label">Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Số điện thoại</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={authContext?.user?.email || ''}
            disabled
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Vai trò</label>
          <input
            type="text"
            value={authContext?.user?.role || ''}
            disabled
            className="form-input"
          />
        </div>

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
