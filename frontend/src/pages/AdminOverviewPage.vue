<script setup>
import { onMounted } from 'vue'
import { useAdminOverview } from '@/composables/useAdminOverview'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const { isLoading, fetchOverview, campaignsByStatus, totalCollectedPlatform, totalPlatformFee, campaignsPerMonth } = useAdminOverview()

onMounted(() => {
    fetchOverview()
})

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function getStatusClass(status) {
    const map = {
        active: 'bg-green-100 text-green-700',
        success: 'bg-blue-100 text-blue-700',
        failed: 'bg-red-100 text-red-700',
        draft: 'bg-gray-100 text-gray-700',
        review: 'bg-yellow-100 text-yellow-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
}

const chartData = () => ({
    labels: Object.keys(campaignsPerMonth.value),
    datasets: [
        {
            label: 'Kampanye Baru',
            data: Object.values(campaignsPerMonth.value),
            backgroundColor: '#22c55e',
        },
    ],
})

const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-2xl font-bold mb-6">Overview Platform</h1>

            <div v-if="isLoading" class="text-gray-500">Memuat data...</div>

            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <p class="text-sm text-gray-500">Total Dana Terkumpul (Seluruh Platform)</p>
                        <p class="text-2xl font-bold">{{ formatCurrency(totalCollectedPlatform) }}</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <p class="text-sm text-gray-500">Total Platform Fee (Estimasi 5%)</p>
                        <p class="text-2xl font-bold">{{ formatCurrency(totalPlatformFee) }}</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 class="font-semibold mb-4">Kampanye per Status</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        <div v-for="item in campaignsByStatus" :key="item.status"
                            class="text-center p-3 border rounded-lg">
                            <span class="text-xs font-medium px-2 py-1 rounded-full"
                                :class="getStatusClass(item.status)">
                                {{ item.status }}
                            </span>
                            <p class="text-2xl font-bold mt-2">{{ item.count }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="font-semibold mb-4">Kampanye Baru per Bulan (berdasarkan deadline)</h2>
                    <Bar :data="chartData()" :options="chartOptions" />
                </div>
            </div>
        </div>
    </div>
</template>