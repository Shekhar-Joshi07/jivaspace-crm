import api, { unwrap } from '../api/axios';

export const attendanceService = {
  async today() {
    return unwrap(await api.get('/attendance/today'));
  },
  async checkIn(payload) {
    return unwrap(await api.post('/attendance/check-in', payload));
  },
  async checkOut(payload) {
    return unwrap(await api.post('/attendance/check-out', payload));
  },
  async getConfiguration() {
    return unwrap(await api.get('/attendance/config'));
  },
  async saveConfiguration(payload) {
    return unwrap(await api.put('/attendance/config', payload));
  },
  async audit(params = {}) {
    const response = await api.get('/attendance/audit', { params });
    return { records: unwrap(response), pagination: response.data.pagination };
  }
};
