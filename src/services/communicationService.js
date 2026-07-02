import api, { unwrap } from '../api/axios';

export const communicationService = {
  async list(params = {}) {
    const response = await api.get('/communications', { params });
    return { logs: unwrap(response), pagination: response.data.pagination };
  },
  async sendEmail(leadId, payload) {
    return unwrap(await api.post(`/communications/leads/${leadId}/email`, payload));
  },
  async sendSMS(leadId, payload) {
    return unwrap(await api.post(`/communications/leads/${leadId}/sms`, payload));
  }
};
