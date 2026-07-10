<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'

const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications()
const overlayPanel = ref(null)
const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
    authStore.logout()
    router.push('/login')
}
const showMobileMenu = ref(false)

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
    <nav class="bg-white shadow-md px-6 py-3 sticky top-0 z-50">
        <div class="flex justify-between items-center">
            <router-link to="/" class="font-bold text-lg text-green-600">CoFund</router-link>

            <div class="flex items-center gap-5">
                <router-link to="/campaigns"
                    class="hidden md:inline text-sm text-gray-600 hover:text-gray-900">Kampanye</router-link>
                <router-link v-if="authStore.user?.role === 'backer'" to="/my-backings"
                    class="hidden md:inline text-sm text-gray-600 hover:text-gray-900">Dashboard Saya</router-link>
                <router-link v-if="authStore.user?.role === 'creator'" to="/dashboard/creator"
                    class="hidden md:inline text-sm text-gray-600 hover:text-gray-900">
                    Dashboard Creator
                </router-link>
                <router-link v-if="authStore.user?.role === 'creator'" to="/campaigns/create"
                    class="hidden md:inline text-sm text-gray-600 hover:text-gray-900">
                    Buat Kampanye
                </router-link>
                <router-link v-if="authStore.user?.role === 'admin'" to="/admin/approval"
                    class="hidden md:inline text-sm text-gray-600 hover:text-gray-900">
                    Approval
                </router-link>
                <router-link v-if="authStore.user?.role === 'admin'" to="/admin/users"
                    class="hidden md:inline text-sm text-gray-600 hover:text-gray-900">
                    User
                </router-link>
                <router-link v-if="authStore.user?.role === 'admin'" to="/admin/overview"
                    class="hidden md:inline text-sm text-gray-600 hover:text-gray-900">
                    Overview
                </router-link>

                <div class="hidden md:block w-px h-6 bg-gray-200"></div>
                <button v-if="authStore.isLoggedIn" class="relative" @click="toggleNotifications">
                    <i class="pi pi-bell text-xl text-gray-600"></i>
                    <span v-if="unreadCount > 0"
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {{ unreadCount }}
                    </span>
                </button>

                <button class="md:hidden" @click="showMobileMenu = !showMobileMenu">
                    <i class="pi pi-bars text-xl text-gray-600"></i>
                </button>

                <div v-if="authStore.isLoggedIn" class="hidden md:flex items-center gap-2">
                    <span class="text-sm text-gray-600">{{ authStore.user.name }}</span>
                    <Button label="Logout" size="small" severity="secondary" @click="handleLogout" />
                </div>
                <div v-else class="hidden md:flex items-center gap-2">
                    <router-link to="/login" class="text-sm text-gray-600 hover:text-gray-900">Masuk</router-link>
                    <router-link to="/register">
                        <Button label="Daftar" size="small" severity="success" />
                    </router-link>
                </div>

                <OverlayPanel ref="overlayPanel" class="w-80">
                    <div class="flex flex-col gap-2 max-h-80 overflow-y-auto">
                        <p v-if="notifications.length === 0" class="text-gray-500 text-sm p-2">Belum ada notifikasi.</p>
                        <div v-for="notif in notifications" :key="notif.id"
                            class="p-2 rounded cursor-pointer hover:bg-gray-50"
                            :class="!notif.is_read ? 'bg-blue-50' : ''" @click="handleClickNotification(notif)">
                            <p class="text-sm">{{ notif.message }}</p>
                            <p class="text-xs text-gray-400 mt-1">{{ notif.created_at }}</p>
                        </div>
                    </div>
                </OverlayPanel>
            </div>
        </div>

        <div v-if="showMobileMenu" class="md:hidden flex flex-col gap-2 mt-3 pt-3 border-t">
            <router-link to="/campaigns" class="text-sm text-gray-600 py-1"
                @click="showMobileMenu = false">Kampanye</router-link>
            <router-link v-if="authStore.user?.role === 'backer'" to="/my-backings" class="text-sm text-gray-600 py-1"
                @click="showMobileMenu = false">Dashboard
                Saya</router-link>
            <router-link v-if="authStore.user?.role === 'creator'" to="/dashboard/creator"
                class="text-sm text-gray-600 py-1" @click="showMobileMenu = false">
                Dashboard Creator
            </router-link>
            <router-link v-if="authStore.user?.role === 'creator'" to="/campaigns/create"
                class="text-sm text-gray-600 py-1" @click="showMobileMenu = false">
                Buat Kampanye
            </router-link>
            <router-link v-if="authStore.user?.role === 'admin'" to="/admin/approval" class="text-sm text-gray-600 py-1"
                @click="showMobileMenu = false">
                Approval
            </router-link>
            <router-link v-if="authStore.user?.role === 'admin'" to="/admin/users" class="text-sm text-gray-600 py-1"
                @click="showMobileMenu = false">
                User
            </router-link>
            <router-link v-if="authStore.user?.role === 'admin'" to="/admin/overview" class="text-sm text-gray-600 py-1"
                @click="showMobileMenu = false">
                Overview
            </router-link>
            <div v-if="authStore.isLoggedIn" class="flex items-center justify-between pt-2">
                <span class="text-sm text-gray-600">{{ authStore.user.name }}</span>
                <Button label="Logout" size="small" severity="secondary" @click="handleLogout" />
            </div>
            <template v-if="!authStore.isLoggedIn">
                <router-link to="/login" class="text-sm text-gray-600 py-1"
                    @click="showMobileMenu = false">Masuk</router-link>
                <router-link to="/register" class="text-sm text-gray-600 py-1"
                    @click="showMobileMenu = false">Daftar</router-link>
            </template>
        </div>
    </nav>
</template>