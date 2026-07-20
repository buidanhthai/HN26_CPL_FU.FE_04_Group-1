import axios from 'axios';

const API_BASE_URL = 'http://localhost:5201/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj: any = JSON.parse(storedUser);
        const token = userObj?.token || userObj?.Token || userObj?.accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[API Interceptor] Attached Authorization token to request:', config.url);
        } else {
          console.warn('[API Interceptor Warning] Token missing in localStorage user object:', userObj);
        }
      } catch (error) {
        console.error('[API Interceptor Error] Failed to parse stored user:', error);
      }
    } else {
      console.warn('[API Interceptor Warning] No user found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API Interceptor 401] Token rejected or expired. Clearing invalid session from localStorage.');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
