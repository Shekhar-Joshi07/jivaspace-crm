import api, { unwrap } from '../api/axios';

export const bookingService = {
  async list(params = {}) {
    const response = await api.get('/bookings', { params });
    return { bookings: unwrap(response), pagination: response.data.pagination };
  },
  async get(id) {
    return unwrap(await api.get(`/bookings/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/bookings', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/bookings/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/bookings/${id}`)).data;
  }
};
