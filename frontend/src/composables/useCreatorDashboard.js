import { ref, computed } from 'vue'
import { campaignService } from '@/services/campaignService'
import { backingService } from '@/services/backingService'

export function useCreatorDashboard() {
    const myCampaigns = ref([])
    const allBackings = ref([])
    const isLoading = ref(false)

    async function fetchDashboard(creatorId) {
        isLoading.value = true
        try {
            const campaignsRes = await campaignService.getCampaignsByCreator(creatorId)
            myCampaigns.value = campaignsRes.data

            const backingsPerCampaign = await Promise.all(
                myCampaigns.value.map((c) => backingService.getByCampaign(c.id))
            )
            allBackings.value = backingsPerCampaign.flatMap((res) => res.data)
        } finally {
            isLoading.value = false
        }
    }

    const totalCollected = computed(() =>
        myCampaigns.value.reduce((sum, c) => sum + c.collected_amount, 0)
    )

    const totalBackers = computed(() => {
        const uniqueUserIds = new Set(allBackings.value.map((b) => b.user_id))
        return uniqueUserIds.size
    })

    const totalCampaigns = computed(() => myCampaigns.value.length)

    return {
        myCampaigns, isLoading, fetchDashboard,
        totalCollected, totalBackers, totalCampaigns,
    }
}