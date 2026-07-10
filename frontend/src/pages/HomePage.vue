<script setup>
import { onMounted, computed } from 'vue'
import { useCampaign } from '@/composables/useCampaign'
import { getProgress, getDaysLeft, formatCurrency, formatDeadline } from '@/utils/campaignFormatters'
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
        <section
            class="relative bg-gradient-to-br from-green-600 via-green-600 to-green-700 text-white overflow-hidden">
            <div
                class="absolute top-0 right-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3">
            </div>
            <div
                class="absolute bottom-0 left-0 w-72 h-72 bg-green-800/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3">
            </div>
            <div class="relative max-w-6xl mx-auto px-6 py-16 md:py-[5.5rem] grid md:grid-cols-2 gap-10 items-center">
                <div class="text-center md:text-left">
                    <h1 class="text-3xl md:text-5xl font-bold mb-4">
                        Wujudkan Ide Menjadi Nyata Bersama CoFund
                    </h1>
                    <p class="text-green-50 text-base md:text-lg max-w-xl mb-8">
                        Platform crowdfunding lokal untuk mendukung kreator, komunitas, dan ide-ide
                        yang butuh dana untuk bisa terwujud.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        <router-link to="/register">
                            <Button label="Mulai Sekarang" size="large"
                                class="!bg-white !text-green-600 !border-none" />
                        </router-link>
                        <router-link to="/login">
                            <Button label="Masuk" size="large" outlined
                                class="!border-white !text-white hover:!bg-white/10 hover:!text-white" />
                        </router-link>
                    </div>
                </div>

                <div class="max-w-xs mx-auto md:max-w-none">
                    <svg viewBox="0 0 400 400" class="w-full h-auto">
                        <circle cx="200" cy="200" r="140" fill="white" fill-opacity="0.08" />
                        <circle cx="150" cy="160" r="70" fill="white" fill-opacity="0.15" />
                        <circle cx="260" cy="240" r="50" fill="white" fill-opacity="0.2" />
                        <circle cx="230" cy="140" r="30" fill="white" fill-opacity="0.25" />
                        <path d="M 90 280 Q 160 220 200 240 T 310 150" stroke="white" stroke-width="3"
                            stroke-opacity="0.4" fill="none" stroke-linecap="round" />
                        <circle cx="310" cy="150" r="8" fill="white" />
                    </svg>
                </div>
            </div>
        </section>

        <!-- Kenapa CoFund Section -->
        <section class="max-w-6xl mx-auto px-6 py-12">
            <h2 class="text-2xl font-bold text-gray-800 text-center mb-8">Kenapa CoFund?</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                    <div
                        class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-shield text-xl"></i>
                    </div>
                    <h3 class="font-semibold mb-2">Dana Aman di Escrow</h3>
                    <p class="text-sm text-gray-500">Dana kamu ditahan aman hingga kampanye berhasil, baru dicairkan ke
                        creator.</p>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                    <div
                        class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-gift text-xl"></i>
                    </div>
                    <h3 class="font-semibold mb-2">Tier Reward Menarik</h3>
                    <p class="text-sm text-gray-500">Pilih tier dukungan sesuai budget dan dapatkan reward eksklusif
                        dari creator.</p>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                    <div
                        class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-refresh text-xl"></i>
                    </div>
                    <h3 class="font-semibold mb-2">Refund Otomatis</h3>
                    <p class="text-sm text-gray-500">Kalau target tidak tercapai, dana otomatis dikembalikan penuh ke
                        akunmu.</p>
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
                    class="group bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div class="overflow-hidden">
                        <img :src="item.image" :alt="item.title"
                            class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                            </div>

                        <div class="p-4 flex flex-col flex-1">
                            <span
                                class="text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-2 bg-green-100 text-green-700 uppercase tracking-wide">
                                {{ item.status }}
                            </span>

                            <h3 class="font-semibold text-lg">{{ item.title }}</h3>
                            <p class="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{{ item.description }}</p>

                            <div class="mt-4">
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full"
                                        :style="{ width: getProgress(item) + '%' }">
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

            <div class="text-center mt-8 md:hidden">
                <router-link to="/campaigns">
                    <Button label="Lihat Semua Kampanye" outlined />
                </router-link>
            </div>
        </section>
    </div>
</template>