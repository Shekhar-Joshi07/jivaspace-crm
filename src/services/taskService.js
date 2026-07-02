import api, { unwrap } from '../api/axios';

export const taskService = {
  async list(params = {}) {
    const response = await api.get('/tasks', { params });
    return { tasks: unwrap(response), pagination: response.data.pagination };
  },
  async get(id) {
    return unwrap(await api.get(`/tasks/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/tasks', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/tasks/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/tasks/${id}`)).data;
  }
};
