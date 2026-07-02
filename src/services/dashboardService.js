import api, { unwrap } from '../api/axios';

export const dashboardService = {
  async getStats() {
    return unwrap(await api.get('/dashboard/stats'));
  },
  async getCalendar(params = {}) {
    return unwrap(await api.get('/dashboard/calendar', { params }));
  }
};
