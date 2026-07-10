import { ref } from 'vue'
import dayjs from 'dayjs'
import { campaignService } from '@/services/campaignService'
import { backingService } from '@/services/backingService'
import { userService } from '@/services/userService'
import { notifService } from '@/services/notifService'

export function useAdminApproval() {
    const reviewCampaigns = ref([])
    const cancellationRequests = ref([])
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

    async function fetchCancellationRequests() {
        const res = await campaignService.getAll({ cancellation_requested: true })
        cancellationRequests.value = res.data
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

    async function approveCancellation(campaignId) {
        const campaign = cancellationRequests.value.find((c) => c.id === campaignId)
        if (!campaign) return

        await campaignService.update(campaignId, {
            status: 'failed',
            cancellation_requested: false,
        })

        const backingsRes = await backingService.getByCampaign(campaignId)
        const completedBackings = backingsRes.data.filter((b) => b.status === 'completed')

        for (const backing of completedBackings) {
            const userRes = await userService.getById(backing.user_id)
            const backer = userRes.data
            await userService.update(backer.id, { balance: (backer.balance || 0) + backing.amount })
            await backingService.update(backing.id, { status: 'refunded' })
            await notifService.create({
                user_id: backing.user_id,
                message: `Kampanye '${campaign.title}' dibatalkan, dana kamu sebesar ${backing.amount} telah dikembalikan`,
                is_read: false,
                created_at: dayjs().format('YYYY-MM-DD'),
            })
        }

        await notifService.create({
            user_id: campaign.creator_id,
            message: `Permintaan pembatalan kampanye '${campaign.title}' telah disetujui admin. Dana backer sudah dikembalikan`,
            is_read: false,
            created_at: dayjs().format('YYYY-MM-DD'),
        })

        await fetchCancellationRequests()
    }

    async function extendDeadline(campaignId, newDeadline) {
        const campaign = cancellationRequests.value.find((c) => c.id === campaignId)
        if (!campaign) return

        await campaignService.update(campaignId, {
            deadline: newDeadline,
            cancellation_requested: false,
        })

        await notifService.create({
            user_id: campaign.creator_id,
            message: `Permintaan pembatalan kampanye '${campaign.title}' ditolak, deadline diperpanjang hingga ${newDeadline}`,
            is_read: false,
            created_at: dayjs().format('YYYY-MM-DD'),
        })

        await fetchCancellationRequests()
    }

    return {
        reviewCampaigns,
        cancellationRequests,
        isLoading,
        fetchReviewCampaigns,
        fetchCancellationRequests,
        approveCampaign,
        rejectCampaign,
        approveCancellation,
        extendDeadline,
    }
}