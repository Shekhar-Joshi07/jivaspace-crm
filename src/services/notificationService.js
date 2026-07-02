import api, { unwrap } from '../api/axios';

export const notificationService = {
  async list(params = {}) {
    const response = await api.get('/notifications', { params });
    return {
      notifications: unwrap(response),
      pagination: response.data.pagination,
      unread: response.data.meta?.unread || 0
    };
  },
  async unreadCount() {
    return unwrap(await api.get('/notifications/unread-count'));
  },
  async markRead(id) {
    return unwrap(await api.patch(`/notifications/${id}/read`));
  },
  async markAllRead() {
    return (await api.patch('/notifications/read-all')).data;
  },
  async remove(id) {
    return (await api.delete(`/notifications/${id}`)).data;
  }
};
