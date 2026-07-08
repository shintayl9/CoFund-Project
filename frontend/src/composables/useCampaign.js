import { storeToRefs } from 'pinia'
import { useCampaignStore } from '@/stores/useCampaignStore'
import { campaignService } from '@/services/campaignService'
import { tierService } from '@/services/tierService'
import { backingService } from '@/services/backingService'
import { userService } from '@/services/userService'

export function useCampaign() {
    const store = useCampaignStore()
    const { campaigns, campaign, tiers, backings, updates, users, isLoading } = storeToRefs(store)

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
        const res = await tierService.getByCampaign(campaignId)
        tiers.value = res.data
    }

    async function fetchBackings(campaignId) {
        const res = await backingService.getByCampaign(campaignId)
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
        const res = await userService.getAll()
        users.value = res.data
    }

    return {
        campaigns, campaign, tiers, backings, users, updates, isLoading,
        fetchAll, fetchOne, fetchTiers, fetchBackings, fetchUsers, fetchUpdates, postUpdate,
    }
}