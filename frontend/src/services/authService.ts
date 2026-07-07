import api from './api';
import type { User } from '../types/user.types';

export const authService = {
  login: async (data: { username: string; password: any }): Promise<User> => {
  // Biến dữ liệu form từ ô "username" của React thành thuộc tính "Email" gửi lên .NET
  const response = await api.post('/auth/login', {
    Email: data.username, // Gửi chính xác từ khóa Email viết hoa chữ cái đầu sang Backend
    Password: data.password
  });
  return response.data;
},
  register: async (data: any): Promise<{ message: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  updateProfile: async (data: { fullName: string; phoneNumber: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }
};