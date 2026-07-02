import api, { unwrap } from '../api/axios';

export const authService = {
  async login(credentials) {
    return (await api.post('/auth/login', credentials)).data;
  },
  async register(payload) {
    return (await api.post('/auth/register', payload)).data;
  },
  async me() {
    return unwrap(await api.get('/auth/me'));
  },
  async logout() {
    return api.post('/auth/logout');
  },
  async forgotPassword(email) {
    return (await api.post('/auth/forgot-password', { email })).data;
  },
  async resetPassword(token, password) {
    return (await api.post(`/auth/reset-password/${token}`, { password })).data;
  },
  async changePassword(payload) {
    return (await api.put('/auth/change-password', payload)).data;
  }
};
