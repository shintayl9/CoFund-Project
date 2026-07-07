import { ref, computed } from 'vue'
import { campaignService } from '@/services/campaignService'
import dayjs from 'dayjs'

export function useAdminOverview() {
    const allCampaigns = ref([])
    const isLoading = ref(false)

    async function fetchOverview() {
        isLoading.value = true
        try {
            const res = await campaignService.getAll()
            allCampaigns.value = res.data
        } finally {
            isLoading.value = false
        }
    }

    const campaignsByStatus = computed(() => {
        const statuses = ['draft', 'review', 'active', 'success', 'failed']
        return statuses.map((status) => ({
            status,
            count: allCampaigns.value.filter((c) => c.status === status).length,
        }))
    })

    const totalCollectedPlatform = computed(() =>
        allCampaigns.value.reduce((sum, c) => sum + c.collected_amount, 0)
    )

    const totalPlatformFee = computed(() => {
        const successCampaigns = allCampaigns.value.filter((c) => c.status === 'success')
        const totalSuccess = successCampaigns.reduce((sum, c) => sum + c.collected_amount, 0)
        return Math.round(totalSuccess * 0.05)
    })

    const campaignsPerMonth = computed(() => {
        const months = {}
        allCampaigns.value.forEach((c) => {
            const month = dayjs(c.deadline).format('MMM YYYY')
            months[month] = (months[month] || 0) + 1
        })
        return months
    })

    return {
        allCampaigns, isLoading, fetchOverview,
        campaignsByStatus, totalCollectedPlatform, totalPlatformFee, campaignsPerMonth,
    }
}