import api from './api';
import type { User } from '../types/user.types';

export const authService = {
  login: async (data: { username: string; password: any }): Promise<User> => {
    const response = await api.post('/auth/login', {
      Email: data.username,
      Password: data.password
    });
    const resData = response.data;
    const token = resData.token || resData.Token;
    const normalizedUser: User = {
      id: resData.id || resData.Id,
      fullName: resData.fullName || resData.FullName || data.username,
      email: resData.email || resData.Email || data.username,
      role: (resData.role || resData.Role || 'USER').toUpperCase() as any,
      phoneNumber: resData.phoneNumber || resData.PhoneNumber,
      token: token
    };
    return normalizedUser;
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