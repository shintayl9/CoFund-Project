<script setup>
import { onMounted } from 'vue'
import { useAdminUsers } from '@/composables/useAdminUsers'
import { useToast } from 'vue-toastification'
import Button from 'primevue/button'

const { users, isLoading, fetchUsers, toggleSuspend } = useAdminUsers()
const toast = useToast()

onMounted(() => {
    fetchUsers()
})

function getRoleClass(role) {
    const map = {
        admin: 'bg-purple-100 text-purple-700',
        creator: 'bg-blue-100 text-blue-700',
        backer: 'bg-green-100 text-green-700',
    }
    return map[role] || 'bg-gray-100 text-gray-700'
}

async function handleToggleSuspend(user) {
    try {
        await toggleSuspend(user.id, user.is_suspended)
        toast.success(user.is_suspended ? 'User berhasil diaktifkan kembali' : 'User berhasil di-suspend')
    } catch (error) {
        toast.error('Gagal mengubah status user')
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold mb-6">Manajemen User</h1>

            <div v-if="isLoading" class="text-gray-500">Memuat data...</div>

            <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
                <div v-for="user in users" :key="user.id"
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b last:border-b-0">
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-medium">{{ user.name }}</p>
                            <span class="text-xs font-medium px-2 py-1 rounded-full" :class="getRoleClass(user.role)">
                                {{ user.role }}
                            </span>
                            <span v-if="user.is_suspended"
                                class="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                                Suspended
                            </span>
                        </div>
                        <p class="text-sm text-gray-500">{{ user.email }}</p>
                    </div>

                    <Button :label="user.is_suspended ? 'Aktifkan' : 'Suspend'" size="small"
                        :severity="user.is_suspended ? 'success' : 'danger'" @click="handleToggleSuspend(user)" />
                </div>
            </div>
        </div>
    </div>
</template>