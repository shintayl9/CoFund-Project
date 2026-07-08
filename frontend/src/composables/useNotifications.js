import { ref, computed } from 'vue'
import { notifService } from '@/services/notifService'

const CURRENT_USER_ID = 2 // sementara hardcode, nanti diganti dari sistem auth

export function useNotifications() {
    const notifications = ref([])

    async function fetchNotifications() {
        const res = await notifService.getByUser(CURRENT_USER_ID)
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