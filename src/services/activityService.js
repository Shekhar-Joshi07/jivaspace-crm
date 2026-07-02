import api, { unwrap } from '../api/axios';

export const activityService = {
  async list(params = {}) {
    const response = await api.get('/activities', { params });
    return { activities: unwrap(response), pagination: response.data.pagination };
  },
  async create(payload) {
    return unwrap(await api.post('/activities', payload));
  }
};
