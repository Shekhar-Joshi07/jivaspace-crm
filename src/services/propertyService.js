import api, { unwrap } from '../api/axios';

export const propertyService = {
  async list() {
    return unwrap(await api.get('/properties'));
  },
  async create(payload) {
    return unwrap(await api.post('/properties', payload));
  },
  async uploadImages(files) {
    const form = new FormData();
    files.forEach(file => form.append('images', file));
    return unwrap(await api.post('/properties/upload-images', form));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/properties/${id}`, payload));
  },
  async remove(id) {
    return unwrap(await api.delete(`/properties/${id}`));
  }
};
