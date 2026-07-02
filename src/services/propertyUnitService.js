import api, { unwrap } from '../api/axios';

export const propertyUnitService = {
  async list(params = {}) {
    const response = await api.get('/property-units', { params });
    return { propertyUnits: unwrap(response), pagination: response.data.pagination };
  },
  async get(id) {
    return unwrap(await api.get(`/property-units/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/property-units', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/property-units/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/property-units/${id}`)).data;
  }
};
