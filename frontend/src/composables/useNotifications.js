import { ref, computed } from 'vue'
import { campaignService } from '@/services/campaignService'

const CURRENT_USER_ID = 2 // sementara hardcode, nanti diganti dari sistem auth

export function useNotifications() {
    const notifications = ref([])

    async function fetchNotifications() {
        const res = await campaignService.getNotificationsByUser(CURRENT_USER_ID)
        notifications.value = res.data
    }

    async function markAsRead(notifId) {
        await campaignService.markNotificationAsRead(notifId)
        const notif = notifications.value.find((n) => n.id === notifId)
        if (notif) notif.is_read = true
    }

    const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

    return { notifications, unreadCount, fetchNotifications, markAsRead }
}