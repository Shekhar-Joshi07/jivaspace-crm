import axios from 'axios';

export const TOKEN_KEY = 'crm_token';
export const USER_KEY = 'crm_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
  headers: { Accept: 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('crm:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = error => {
  const response = error?.response?.data;
  if (response?.errors?.length) {
    return response.errors.map(item => item.message).join(', ');
  }
  return response?.message || error?.message || 'Something went wrong. Please try again.';
};

export const unwrap = response => response.data?.data ?? response.data;

export default api;
