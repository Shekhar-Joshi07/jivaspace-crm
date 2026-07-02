import api, { unwrap } from '../api/axios';

export const siteVisitService = {
  async list(params = {}) {
    const response = await api.get('/site-visits', { params });
    return { siteVisits: unwrap(response), pagination: response.data.pagination };
  },
  async get(id) {
    return unwrap(await api.get(`/site-visits/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/site-visits', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/site-visits/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/site-visits/${id}`)).data;
  }
};
