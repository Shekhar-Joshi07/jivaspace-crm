import api, { unwrap } from '../api/axios';

export const teamService = {
  async list() {
    return unwrap(await api.get('/teams'));
  },
  async get(id) {
    return unwrap(await api.get(`/teams/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/teams', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/teams/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/teams/${id}`)).data;
  }
};
