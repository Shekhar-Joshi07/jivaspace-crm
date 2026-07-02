import api, { unwrap } from '../api/axios';

export const fileService = {
  async list(params = {}) {
    const response = await api.get('/files', { params });
    return { files: unwrap(response), pagination: response.data.pagination };
  },
  async upload({ file, leadId, category }) {
    const form = new FormData();
    form.append('file', file);
    form.append('leadId', leadId);
    form.append('category', category);
    return unwrap(await api.post('/files', form));
  },
  async download(id) {
    return (await api.get(`/files/${id}/download`, { responseType: 'blob' })).data;
  },
  async remove(id) {
    return (await api.delete(`/files/${id}`)).data;
  }
};
