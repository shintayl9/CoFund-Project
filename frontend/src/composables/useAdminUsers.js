import { ref } from 'vue'
import { campaignService } from '@/services/campaignService'

export function useAdminUsers() {
    const users = ref([])
    const isLoading = ref(false)

    async function fetchUsers() {
        isLoading.value = true
        try {
            const res = await campaignService.getAllUsers()
            users.value = res.data
        } finally {
            isLoading.value = false
        }
    }

    async function toggleSuspend(userId, currentStatus) {
        await campaignService.updateUserStatus(userId, !currentStatus)
        await fetchUsers()
    }

    return { users, isLoading, fetchUsers, toggleSuspend }
}