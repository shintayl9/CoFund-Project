<script setup>
import { onMounted, computed } from 'vue'
import { useCampaign } from '@/composables/useCampaign'
import { getProgress, getDaysLeft, formatCurrency } from '@/utils/campaignFormatters'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'

const { campaigns, isLoading, fetchAll } = useCampaign()

onMounted(() => {
    fetchAll()
})

const publicCampaigns = computed(() => {
    return campaigns.value.filter((item) => item.status === 'active')
})

const featuredCampaigns = computed(() => publicCampaigns.value.slice(0, 6))

</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Hero Section -->
        <section class="bg-green-600 text-white">
            <div class="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
                <h1 class="text-3xl md:text-5xl font-bold mb-4">
                    Wujudkan Ide Menjadi Nyata Bersama CoFund
                </h1>
                <p class="text-green-50 text-base md:text-lg max-w-2xl mx-auto mb-8">
                    Platform crowdfunding lokal untuk mendukung kreator, komunitas, dan ide-ide
                    yang butuh dana untuk bisa terwujud.
                </p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <router-link to="/register">
                        <Button label="Mulai Sekarang" size="large" class="!bg-white !text-green-600 !border-none" />
                    </router-link>
                    <router-link to="/login">
                        <Button label="Masuk" size="large" outlined class="!border-white !text-white" />
                    </router-link>
                </div>
            </div>
        </section>

        <!-- Public Campaigns Section -->
        <section class="max-w-6xl mx-auto px-6 py-12">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Kampanye Sedang Berlangsung</h2>
                <router-link to="/campaigns" class="text-sm text-green-600 hover:underline hidden md:inline">
                    Lihat Semua &rarr;
                </router-link>
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

            <div v-else-if="featuredCampaigns.length === 0" class="text-center text-gray-500 py-12">
                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                <p>Belum ada kampanye aktif saat ini. Coba cek lagi nanti ya.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <router-link v-for="item in featuredCampaigns" :key="item.id" :to="`/campaigns/${item.id}`"
                    class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                    <img :src="item.image" :alt="item.title" class="w-full h-40 object-cover" />

                    <div class="p-4 flex flex-col flex-1">
                        <span class="text-xs font-medium px-2 py-1 rounded-full w-fit mb-2 bg-green-100 text-green-700">
                            {{ item.status }}
                        </span>

                        <h3 class="font-semibold text-lg">{{ item.title }}</h3>
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
                                <span class="text-gray-400 font-normal">/ {{ formatCurrency(item.target_amount)
                                }}</span>
                            </p>
                        </div>
                    </div>
                </router-link>
            </div>

            <div class="text-center mt-8 md:hidden">
                <router-link to="/campaigns">
                    <Button label="Lihat Semua Kampanye" outlined />
                </router-link>
            </div>
        </section>
    </div>
</template>