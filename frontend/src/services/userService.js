import api from './api'

export const userService = {
    getAll: () => api.get('/users'),
    getById: (userId) => api.get(`/users/${userId}`),
    updateStatus: (userId, isSuspended) => api.patch(`/users/${userId}`, { is_suspended: isSuspended }),
    update: (userId, data) => api.patch(`/users/${userId}`, data),
}