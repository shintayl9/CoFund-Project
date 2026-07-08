import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCampaignStore = defineStore('campaign', () => {
    const campaigns = ref([])
    const campaign = ref(null)
    const tiers = ref([])
    const backings = ref([])
    const updates = ref([])
    const users = ref([])
    const isLoading = ref(false)

    return { campaigns, campaign, tiers, backings, updates, users, isLoading }
})