<script setup>
import { onMounted } from 'vue'
import { useMyBackings } from '@/composables/useMyBackings'
import dayjs from 'dayjs'

const CURRENT_USER_ID = 2

const { myBackings, isLoading, fetchMyBackings } = useMyBackings()

onMounted(() => {
    fetchMyBackings(CURRENT_USER_ID)
})

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function getStatusClass(status) {
    const map = {
        completed: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        refunded: 'bg-red-100 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
}

const totalDonated = () => {
    return myBackings.value
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.amount, 0)
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold mb-2">Riwayat Backing Saya</h1>
            <p class="text-gray-500 mb-6">
                Total donasi: <span class="font-semibold text-gray-700">{{ formatCurrency(totalDonated()) }}</span>
            </p>

            <div v-if="isLoading" class="text-gray-500">Memuat data...</div>

            <div v-else-if="myBackings.length === 0" class="text-gray-500">
                Kamu belum pernah mendukung kampanye apapun.
            </div>

            <div v-else class="flex flex-col gap-4">
                <router-link v-for="backing in myBackings" :key="backing.id" :to="`/campaigns/${backing.campaign_id}`"
                    class="bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow">
                    <img :src="backing.campaign.image" class="w-24 h-24 object-cover rounded-lg flex-shrink-0" />

                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h2 class="font-semibold">{{ backing.campaign.title }}</h2>
                            <span class="text-xs font-medium px-2 py-1 rounded-full"
                                :class="getStatusClass(backing.status)">
                                {{ backing.status }}
                            </span>
                        </div>
                        <p class="text-lg font-bold mt-2">{{ formatCurrency(backing.amount) }}</p>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>