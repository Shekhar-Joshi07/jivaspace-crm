import api, { unwrap } from '../api/axios';

export const userService = {
  async list(params = {}) {
    const response = await api.get('/users', { params });
    return { users: unwrap(response), pagination: response.data.pagination };
  },
  async get(id) {
    return unwrap(await api.get(`/users/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/users', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/users/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/users/${id}`)).data;
  }
};
