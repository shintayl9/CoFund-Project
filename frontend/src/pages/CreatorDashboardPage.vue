<script setup>
import { onMounted, computed } from 'vue'
import { useCreatorDashboard } from '@/composables/useCreatorDashboard'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)
import dayjs from 'dayjs'

const CURRENT_CREATOR_ID = 1

const { myCampaigns, isLoading, fetchDashboard, totalCollected, totalBackers, totalCampaigns } = useCreatorDashboard()

onMounted(() => {
    fetchDashboard(CURRENT_CREATOR_ID)
})

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function getProgress(item) {
    return Math.min(Math.round((item.collected_amount / item.target_amount) * 100), 100)
}

function getStatusClass(status) {
    const map = {
        active: 'bg-green-100 text-green-700',
        success: 'bg-blue-100 text-blue-700',
        failed: 'bg-red-100 text-red-700',
        draft: 'bg-gray-100 text-gray-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
}

const chartData = computed(() => {
    const days = 7
    const labels = []
    const dataPoints = []

    for (let i = 0; i < days; i++) {
        const date = dayjs().subtract(days - 1 - i, 'day')
        labels.push(date.format('DD/MM'))
        dataPoints.push(Math.round((totalCollected.value / days) * (i + 1)))
    }

    return {
        labels,
        datasets: [
            {
                label: 'Total Terkumpul',
                data: dataPoints,
                borderColor: '#22c55e',
                backgroundColor: '#22c55e',
                tension: 0.3,
            },
        ],
    }
})

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
    },
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-5xl mx-auto">
            <h1 class="text-2xl font-bold mb-6">Dashboard Creator</h1>

            <div v-if="isLoading" class="text-gray-500">Memuat data...</div>

            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <p class="text-sm text-gray-500">Total Kampanye</p>
                        <p class="text-2xl font-bold">{{ totalCampaigns }}</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <p class="text-sm text-gray-500">Total Terkumpul</p>
                        <p class="text-2xl font-bold">{{ formatCurrency(totalCollected) }}</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <p class="text-sm text-gray-500">Total Backer</p>
                        <p class="text-2xl font-bold">{{ totalBackers }}</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 class="font-semibold mb-4">Grafik Funding (7 Hari Terakhir)</h2>
                    <Line :data="chartData" :options="chartOptions" />
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="font-semibold mb-4">Kampanye Saya</h2>
                    <div v-if="myCampaigns.length === 0" class="text-gray-500">Kamu belum membuat kampanye.</div>
                    <div v-else class="flex flex-col gap-3">
                        <router-link v-for="c in myCampaigns" :key="c.id" :to="`/campaigns/${c.id}`"
                            class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-medium">{{ c.title }}</h3>
                                <span class="text-xs font-medium px-2 py-1 rounded-full"
                                    :class="getStatusClass(c.status)">
                                    {{ c.status }}
                                </span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full" :style="{ width: getProgress(c) + '%' }">
                                </div>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">
                                {{ formatCurrency(c.collected_amount) }} / {{ formatCurrency(c.target_amount) }}
                                ({{ getProgress(c) }}%)
                            </p>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>