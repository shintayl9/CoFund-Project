<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCampaign } from '@/composables/useCampaign'
import dayjs from 'dayjs'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

const { campaigns, isLoading, fetchAll } = useCampaign()

const searchQuery = ref('')

const selectedCategory = ref(null)
const selectedStatus = ref(null)

const categoryOptions = [
    { label: 'Semua Kategori', value: null },
    { label: 'Kuliner', value: 1 },
    { label: 'Lingkungan', value: 2 },
    { label: 'Teknologi', value: 3 },
    { label: 'Pendidikan', value: 4 },
]

const statusOptions = [
    { label: 'Semua Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Success', value: 'success' },
    { label: 'Failed', value: 'failed' },
]

const filteredCampaigns = computed(() => {
    return campaigns.value.filter((item) => {
        const matchSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchCategory = !selectedCategory.value || item.category_id === selectedCategory.value
        const matchStatus = !selectedStatus.value || item.status === selectedStatus.value
        return matchSearch && matchCategory && matchStatus
    })
})

onMounted(() => {
    fetchAll()
})

function getProgress(item) {
    return Math.min(Math.round((item.collected_amount / item.target_amount) * 100), 100)
}

function getDaysLeft(deadline) {
    const days = dayjs(deadline).diff(dayjs(), 'day')
    return days > 0 ? `${days} hari lagi` : 'Berakhir'
}

function getStatusClass(status) {
    const map = {
        active: 'bg-green-100 text-green-700',
        success: 'bg-blue-100 text-blue-700',
        failed: 'bg-red-100 text-red-700',
        review: 'bg-yellow-100 text-yellow-700',
        draft: 'bg-gray-100 text-gray-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
}

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <h1 class="text-2xl font-bold mb-6">Daftar Kampanye</h1>

        <div class="mb-6 flex flex-col md:flex-row gap-3">
            <InputText v-model="searchQuery" placeholder="Cari kampanye..." class="w-full md:w-80" />
            <Select v-model="selectedCategory" :options="categoryOptions" optionLabel="label" optionValue="value"
                placeholder="Kategori" class="w-full md:w-52" />
            <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                placeholder="Status" class="w-full md:w-52" />
        </div>

        <div v-if="isLoading" class="text-gray-500">Memuat data...</div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link v-for="item in filteredCampaigns" :key="item.id" :to="`/campaigns/${item.id}`"
                class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <img :src="item.image" :alt="item.title" class="w-full h-40 object-cover" />

                <div class="p-4 flex flex-col flex-1">
                    <span class="text-xs font-medium px-2 py-1 rounded-full w-fit mb-2"
                        :class="getStatusClass(item.status)">
                        {{ item.status }}
                    </span>

                    <h2 class="font-semibold text-lg">{{ item.title }}</h2>
                    <p class="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{{ item.description }}</p>

                    <div class="mt-4">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" :style="{ width: getProgress(item) + '%' }">
                            </div>
                        </div>
                        <div class="flex justify-between text-sm mt-1 text-gray-600">
                            <span>{{ getProgress(item) }}%</span>
                            <span>{{ getDaysLeft(item.deadline) }}</span>
                        </div>
                        <p class="text-sm font-medium mt-1">
                            {{ formatCurrency(item.collected_amount) }}
                            <span class="text-gray-400 font-normal">/ {{ formatCurrency(item.target_amount) }}</span>
                        </p>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>