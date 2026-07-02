import api, { unwrap } from '../api/axios';

const blobRequest = async (url, config = {}) => (await api.get(url, { responseType: 'blob', ...config })).data;

export const leadService = {
  async list(params = {}) {
    const response = await api.get('/leads', { params });
    return { leads: unwrap(response), pagination: response.data.pagination };
  },
  async get(id) {
    return unwrap(await api.get(`/leads/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/leads', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/leads/${id}`, payload));
  },
  async remove(id) {
    return (await api.delete(`/leads/${id}`)).data;
  },
  async updateStatus(id, payload) {
    return unwrap(await api.patch(`/leads/${id}/status`, payload));
  },
  async updateResponse(id, payload) {
    return unwrap(await api.patch(`/leads/${id}/response`, payload));
  },
  async addRemark(id, remarks) {
    return unwrap(await api.post(`/leads/${id}/remarks`, { remarks }));
  },
  async addTimelineEntry(id, payload) {
    return unwrap(await api.post(`/leads/${id}/timeline`, payload));
  },
  async assign(id, assignedTo) {
    return unwrap(await api.patch(`/leads/${id}/assign`, { assignedTo }));
  },
  async transfer(payload) {
    return unwrap(await api.post('/leads/transfer', payload));
  },
  async bulkTransfer(payload) {
    return unwrap(await api.post('/leads/bulk-transfer', payload));
  },
  async pending(params = {}) {
    const response = await api.get('/leads/pending', { params });
    return { leads: unwrap(response), pagination: response.data.pagination };
  },
  async responses(params = {}) {
    const response = await api.get('/leads/responses', { params });
    return { leads: unwrap(response), pagination: response.data.pagination };
  },
  async calendar(params = {}) {
    return unwrap(await api.get('/leads/calendar', { params }));
  },
  async pipeline() {
    return unwrap(await api.get('/leads/pipeline'));
  },
  async checkDuplicateMobile(mobile, excludeLeadId) {
    const response = await api.get('/leads/duplicate-mobile', {
      params: { mobile, excludeLeadId }
    });
    return unwrap(response);
  },
  async bulkImport(leads) {
    return unwrap(await api.post('/leads/bulk-import', { leads }));
  },
  async importSpreadsheet(file) {
    const form = new FormData();
    form.append('file', file);
    return unwrap(await api.post('/leads/import', form));
  },
  async exportSpreadsheet(params = {}) {
    return blobRequest('/leads/export', { params });
  },
  async exportLeads(params = {}) {
    return blobRequest('/leads/export', { params });
  }
};
