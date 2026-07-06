import { ref } from 'vue'
import { campaignService } from '@/services/campaignService'

export function useMyBackings() {
    const myBackings = ref([])
    const isLoading = ref(false)

    async function fetchMyBackings(userId) {
        isLoading.value = true
        try {
            const backingsRes = await campaignService.getBackingsByUser(userId)
            const backings = backingsRes.data

            const withCampaign = await Promise.all(
                backings.map(async (backing) => {
                    const campaignRes = await campaignService.getOne(backing.campaign_id)
                    return { ...backing, campaign: campaignRes.data }
                })
            )

            myBackings.value = withCampaign
        } finally {
            isLoading.value = false
        }
    }

    return { myBackings, isLoading, fetchMyBackings }
}