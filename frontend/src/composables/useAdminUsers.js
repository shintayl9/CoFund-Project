import { ref } from 'vue'
import { userService } from '@/services/userService'

export function useAdminUsers() {
    const users = ref([])
    const isLoading = ref(false)

    async function fetchUsers() {
        isLoading.value = true
        try {
            const res = await userService.getAll()
            users.value = res.data.filter((u) => u.role !== 'admin')
        } finally {
            isLoading.value = false
        }
    }

    async function toggleSuspend(userId, currentStatus) {
        await userService.updateStatus(userId, !currentStatus)
        await fetchUsers()
    }

    return { users, isLoading, fetchUsers, toggleSuspend }
}