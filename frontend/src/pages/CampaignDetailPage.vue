<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import dayjs from 'dayjs'

const route = useRoute()
const { campaign, tiers, backings, users, isLoading, fetchOne, fetchTiers, fetchBackings, fetchUsers } = useCampaign()

onMounted(() => {
    const id = route.params.id
    fetchOne(id)
    fetchTiers(id)
    fetchBackings(id)
    fetchUsers()
})

function getProgress() {
    if (!campaign.value) return 0
    return Math.min(Math.round((campaign.value.collected_amount / campaign.value.target_amount) * 100), 100)
}

function getDaysLeft() {
    if (!campaign.value) return ''
    const days = dayjs(campaign.value.deadline).diff(dayjs(), 'day')
    return days > 0 ? `${days} hari lagi` : 'Berakhir'
}

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function getUserName(userId) {
    const user = users.value.find((u) => u.id === userId)
    return user ? user.name : `User #${userId}`
}

</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div v-if="isLoading" class="text-gray-500">Memuat data...</div>

        <div v-else-if="campaign" class="max-w-4xl mx-auto">
            <img :src="campaign.image" :alt="campaign.title" class="w-full h-64 object-cover rounded-lg mb-6" />

            <h1 class="text-3xl font-bold mb-2">{{ campaign.title }}</h1>
            <p class="text-gray-600 mb-6">{{ campaign.description }}</p>

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-green-500 h-3 rounded-full" :style="{ width: getProgress() + '%' }"></div>
                </div>
                <div class="flex justify-between text-sm mt-2 text-gray-600">
                    <span>{{ getProgress() }}% tercapai</span>
                    <span>{{ getDaysLeft() }}</span>
                </div>
                <p class="text-xl font-semibold mt-2">
                    {{ formatCurrency(campaign.collected_amount) }}
                    <span class="text-gray-400 font-normal text-base">/ target {{ formatCurrency(campaign.target_amount)
                        }}</span>
                </p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold mb-4">Pilihan Tier</h2>
                <div v-if="tiers.length === 0" class="text-gray-500">Belum ada tier untuk kampanye ini.</div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="tier in tiers" :key="tier.id" class="border rounded-lg p-4">
                        <h3 class="font-semibold">{{ tier.name }}</h3>
                        <p class="text-sm text-gray-500 mt-1">{{ tier.description }}</p>
                        <p class="text-sm font-medium mt-2">Minimal {{ formatCurrency(tier.min_amount) }}</p>
                        <p class="text-xs text-gray-400 mt-1">
                            Sisa kuota: {{ tier.remaining_quota }} / {{ tier.quota }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4">Daftar Backer</h2>
                <div v-if="backings.length === 0" class="text-gray-500">Belum ada yang mendukung kampanye ini.</div>
                <ul v-else class="divide-y">
                    <li v-for="backing in backings" :key="backing.id" class="py-2 flex justify-between">
                        <span>{{ getUserName(backing.user_id) }}</span>
                        <span class="font-medium">{{ formatCurrency(backing.amount) }}</span>
                    </li>
                </ul>
            </div>
        </div>

        <div v-else class="text-gray-500">Kampanye tidak ditemukan.</div>
    </div>
</template>