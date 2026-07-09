import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { notifService } from '@/services/notifService'

export function useNotifications() {
    const authStore = useAuthStore()
    const notifications = ref([])

    async function fetchNotifications() {
        if (!authStore.user) return
        const res = await notifService.getByUser(authStore.user.id)
        notifications.value = res.data
    }

    async function markAsRead(notifId) {
        await notifService.markAsRead(notifId)
        const notif = notifications.value.find((n) => n.id === notifId)
        if (notif) notif.is_read = true
    }

    const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

    return { notifications, unreadCount, fetchNotifications, markAsRead }
}