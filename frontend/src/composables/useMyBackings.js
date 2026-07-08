import { ref } from 'vue'
import { campaignService } from '@/services/campaignService'
import { backingService } from '@/services/backingService'
import { userService } from '@/services/userService'

export function useMyBackings() {
    const myBackings = ref([])
    const currentUser = ref(null)
    const isLoading = ref(false)

    async function fetchMyBackings(userId) {
        isLoading.value = true
        try {
            const [backingsRes, userRes] = await Promise.all([
                backingService.getByUser(userId),
                userService.getById(userId),
            ])

            currentUser.value = userRes.data

            const withCampaign = await Promise.all(
                backingsRes.data.map(async (backing) => {
                    const campaignRes = await campaignService.getOne(backing.campaign_id)
                    return { ...backing, campaign: campaignRes.data }
                })
            )

            myBackings.value = withCampaign
        } finally {
            isLoading.value = false
        }
    }

    return { myBackings, currentUser, isLoading, fetchMyBackings }
}