<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCampaign } from '@/composables/useCampaign'
import { getProgress, getDaysLeft, formatCurrency, formatDeadline } from '@/utils/campaignFormatters'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'

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
        const isPublic =
            item.status === 'active' ||
            item.status === 'success'
        const matchSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchCategory = !selectedCategory.value || item.category_id === selectedCategory.value
        const matchStatus = !selectedStatus.value || item.status === selectedStatus.value
        return isPublic && matchSearch && matchCategory && matchStatus
    })
})

onMounted(() => {
    fetchAll()
})

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

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton height="10rem" />
                <div class="p-4 flex flex-col gap-2">
                    <Skeleton width="4rem" height="1.2rem" />
                    <Skeleton width="80%" height="1.5rem" />
                    <Skeleton width="100%" height="2.5rem" />
                    <Skeleton width="100%" height="0.5rem" class="mt-2" />
                </div>
            </div>
        </div>

        <div v-else-if="filteredCampaigns.length === 0" class="text-center text-gray-500 py-12">
            <i class="pi pi-inbox text-4xl mb-3 block"></i>
            <p>Tidak ada kampanye yang cocok dengan pencarian/filter kamu.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link v-for="item in filteredCampaigns" :key="item.id" :to="`/campaigns/${item.id}`"
                class="group bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class="overflow-hidden">
                    <img :src="item.image" :alt="item.title"
                        class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" </div>

                    <div class="p-4 flex flex-col flex-1">
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-2 uppercase tracking-wide"
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
                            <p class="text-xs text-gray-400 mt-1">Deadline: {{ formatDeadline(item.deadline) }}</p>
                            <p class="text-sm font-medium mt-1">
                                {{ formatCurrency(item.collected_amount) }}
                                <span class="text-gray-400 font-normal">/ {{ formatCurrency(item.target_amount)
                                    }}</span>
                            </p>
                        </div>
                    </div>
            </router-link>
        </div>
    </div>
</template>