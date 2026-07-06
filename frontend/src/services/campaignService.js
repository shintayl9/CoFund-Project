import api from './api'

export const campaignService = {
    getAll: (params) => api.get('/campaigns', { params }),
    getOne: (id) => api.get(`/campaigns/${id}`),
    getTiersByCampaign: (campaignId) => api.get('/tiers', { params: { campaign_id: campaignId } }),
    getBackingsByCampaign: (campaignId) => api.get('/backings', { params: { campaign_id: campaignId } }),
    getUsers: () => api.get('/users'),
    create: (data) => api.post('/campaigns', data),
    createTier: (data) => api.post('/tiers', data),
    createBacking: (data) => api.post('/backings', data),
    updateTierQuota: (tierId, data) => api.patch(`/tiers/${tierId}`, data),
    getBackingsByUser: (userId) => api.get('/backings', { params: { user_id: userId } }),
}