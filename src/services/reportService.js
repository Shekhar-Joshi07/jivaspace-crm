import api, { unwrap } from '../api/axios';

export const reportService = {
  async summary(params = {}) {
    return unwrap(await api.get('/reports/summary', { params }));
  },
  async export(params = {}) {
    return (await api.get('/reports/export', { params, responseType: 'blob' })).data;
  }
};
