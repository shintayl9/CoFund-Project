import api from './api'

export const campaignService = {
    getAll: (params) => api.get('/campaigns', { params }),
    getOne: (id) => api.get(`/campaigns/${id}`),
    create: (data) => api.post('/campaigns', data),
    update: (campaignId, data) => api.patch(`/campaigns/${campaignId}`, data),
    getCampaignsByCreator: (creatorId) => api.get('/campaigns', { params: { creator_id: creatorId } }),
    updateStatus: (campaignId, status) => api.patch(`/campaigns/${campaignId}`, { status }),
    getCampaignsByStatus: (status) => api.get('/campaigns', { params: { status } }),
    getUpdatesByCampaign: (campaignId) => api.get('/campaign_updates', { params: { campaign_id: campaignId } }),
    createUpdate: (data) => api.post('/campaign_updates', data),
    delete: (campaignId) => api.delete(`/campaigns/${campaignId}`),
}