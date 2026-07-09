import { ref } from 'vue'
import dayjs from 'dayjs'
import { campaignService } from '@/services/campaignService'
import { notifService } from '@/services/notifService'

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
        const campaign = reviewCampaigns.value.find((c) => c.id === campaignId)
        await campaignService.updateStatus(campaignId, 'active')
        if (campaign) {
            await notifService.create({
                user_id: campaign.creator_id,
                message: `Kampanye '${campaign.title}' kamu telah disetujui dan sekarang aktif`,
                is_read: false,
                created_at: dayjs().format('YYYY-MM-DD'),
            })
        }
        await fetchReviewCampaigns()
    }

    async function rejectCampaign(campaignId, reason) {
        const campaign = reviewCampaigns.value.find((c) => c.id === campaignId)
        await campaignService.update(campaignId, { status: 'draft', rejection_note: reason })
        if (campaign) {
            await notifService.create({
                user_id: campaign.creator_id,
                message: `Kampanye '${campaign.title}' kamu ditolak. Alasan: ${reason}`,
                is_read: false,
                created_at: dayjs().format('YYYY-MM-DD'),
            })
        }
        await fetchReviewCampaigns()
    }

    return { reviewCampaigns, isLoading, fetchReviewCampaigns, approveCampaign, rejectCampaign }
}