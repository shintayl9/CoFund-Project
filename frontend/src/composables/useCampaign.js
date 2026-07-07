import { ref } from 'vue'
import { campaignService } from '@/services/campaignService'

export function useCampaign() {
    const campaigns = ref([])
    const campaign = ref(null)
    const tiers = ref([])
    const backings = ref([])
    const updates = ref([])
    const users = ref([])
    const isLoading = ref(false)

    async function fetchAll(params) {
        isLoading.value = true
        try {
            const res = await campaignService.getAll(params)
            campaigns.value = res.data
        } finally {
            isLoading.value = false
        }
    }

    async function fetchOne(id) {
        isLoading.value = true
        try {
            const res = await campaignService.getOne(id)
            campaign.value = res.data
        } finally {
            isLoading.value = false
        }
    }

    async function fetchTiers(campaignId) {
        const res = await campaignService.getTiersByCampaign(campaignId)
        tiers.value = res.data
    }

    async function fetchBackings(campaignId) {
        const res = await campaignService.getBackingsByCampaign(campaignId)
        backings.value = res.data
    }

    async function fetchUpdates(campaignId) {
        const res = await campaignService.getUpdatesByCampaign(campaignId)
        updates.value = res.data
    }

    async function postUpdate(campaignId, message) {
        await campaignService.createUpdate({
            campaign_id: campaignId,
            message,
            created_at: new Date().toISOString().split('T')[0],
        })
        await fetchUpdates(campaignId)
    }

    async function fetchUsers() {
        const res = await campaignService.getUsers()
        users.value = res.data
    }

    return {
        campaigns, campaign, tiers, backings, users, updates, isLoading,
        fetchAll, fetchOne, fetchTiers, fetchBackings, fetchUsers, fetchUpdates, postUpdate,
    }
}