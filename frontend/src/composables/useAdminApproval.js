import { ref } from 'vue'
import { campaignService } from '@/services/campaignService'

export function useAdminApproval() {
    const reviewCampaigns = ref([])
    const isLoading = ref(false)

    async function fetchReviewCampaigns() {
        isLoading.value = true
        try {
            const res = await campaignService.getCampaignsByStatus('review')
            reviewCampaigns.value = res.data
        } finally {
            isLoading.value = false
        }
    }

    async function approveCampaign(campaignId) {
        await campaignService.updateStatus(campaignId, 'active')
        await fetchReviewCampaigns()
    }

    async function rejectCampaign(campaignId) {
        await campaignService.updateStatus(campaignId, 'draft')
        await fetchReviewCampaigns()
    }

    return { reviewCampaigns, isLoading, fetchReviewCampaigns, approveCampaign, rejectCampaign }
}