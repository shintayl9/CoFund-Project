import api from './api'

export const notifService = {
    getByUser: (userId) => api.get('/notifications', { params: { user_id: userId } }),
    markAsRead: (notifId) => api.patch(`/notifications/${notifId}`, { is_read: true }),
}