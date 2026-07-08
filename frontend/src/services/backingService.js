import api from './api'

export const backingService = {
    getByCampaign: (campaignId) => api.get('/backings', { params: { campaign_id: campaignId } }),
    getByUser: (userId) => api.get('/backings', { params: { user_id: userId } }),
    create: (data) => api.post('/backings', data),
}