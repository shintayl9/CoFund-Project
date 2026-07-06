import api from './api'

export const campaignService = {
    getAll: (params) => api.get('/campaigns', { params }),
    getOne: (id) => api.get(`/campaigns/${id}`),
    getTiersByCampaign: (campaignId) => api.get('/tiers', { params: { campaign_id: campaignId } }),
    getBackingsByCampaign: (campaignId) => api.get('/backings', { params: { campaign_id: campaignId } }),
    getUsers: () => api.get('/users'),

}