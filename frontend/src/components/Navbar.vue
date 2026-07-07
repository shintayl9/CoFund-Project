<script setup>
import { onMounted, ref } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'

const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications()
const overlayPanel = ref(null)

onMounted(() => {
    fetchNotifications()
})

function toggleNotifications(event) {
    overlayPanel.value.toggle(event)
}

async function handleClickNotification(notif) {
    if (!notif.is_read) {
        await markAsRead(notif.id)
    }
}
</script>

<template>
    <nav class="bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <router-link to="/campaigns" class="font-bold text-lg text-green-600">CoFund</router-link>

        <div class="flex items-center gap-4">
            <router-link to="/campaigns" class="text-sm text-gray-600 hover:text-gray-900">Kampanye</router-link>
            <router-link to="/my-backings" class="text-sm text-gray-600 hover:text-gray-900">Dashboard
                Saya</router-link>

            <button class="relative" @click="toggleNotifications">
                <i class="pi pi-bell text-xl text-gray-600"></i>
                <span v-if="unreadCount > 0"
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {{ unreadCount }}
                </span>
            </button>

            <OverlayPanel ref="overlayPanel" class="w-80">
                <div class="flex flex-col gap-2 max-h-80 overflow-y-auto">
                    <p v-if="notifications.length === 0" class="text-gray-500 text-sm p-2">Belum ada notifikasi.</p>
                    <div v-for="notif in notifications" :key="notif.id"
                        class="p-2 rounded cursor-pointer hover:bg-gray-50" :class="!notif.is_read ? 'bg-blue-50' : ''"
                        @click="handleClickNotification(notif)">
                        <p class="text-sm">{{ notif.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ notif.created_at }}</p>
                    </div>
                </div>
            </OverlayPanel>
        </div>
    </nav>
</template>