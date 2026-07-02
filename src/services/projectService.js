import api, { unwrap } from '../api/axios';

export const projectService = {
  async list(params = {}) {
    const response = await api.get('/projects', { params });
    return { projects: unwrap(response), pagination: response.data.pagination };
  },
  async get(id) {
    return unwrap(await api.get(`/projects/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/projects', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/projects/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/projects/${id}`)).data;
  }
};
