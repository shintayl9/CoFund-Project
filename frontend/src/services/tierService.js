import api from './api'

export const tierService = {
    getByCampaign: (campaignId) => api.get('/tiers', { params: { campaign_id: campaignId } }),
    create: (data) => api.post('/tiers', data),
    updateQuota: (tierId, data) => api.patch(`/tiers/${tierId}`, data),
}