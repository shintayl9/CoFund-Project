<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import InputNumber from 'primevue/inputnumber'
import { campaignService } from '@/services/campaignService'
import Skeleton from 'primevue/skeleton'

const route = useRoute()
const { campaign, tiers, backings, users, isLoading, fetchOne, fetchTiers, fetchBackings, fetchUsers } = useCampaign()

const showBackingDialog = ref(false)
const backingMode = ref('tier')
const selectedTierId = ref(null)
const customAmount = ref(0)
const toast = useToast()

function openBackingDialog() {
    backingMode.value = 'tier'
    selectedTierId.value = null
    customAmount.value = 0
    showBackingDialog.value = true
}

const showConfirmDialog = ref(false)
const isProcessingPayment = ref(false)

function getSelectedTier() {
    return tiers.value.find((t) => t.id === selectedTierId.value)
}

function getBackingAmount() {
    return backingMode.value === 'tier' ? getSelectedTier()?.min_amount || 0 : customAmount.value
}

function proceedToConfirm() {
    if (backingMode.value === 'tier' && !selectedTierId.value) {
        toast.error('Pilih salah satu tier terlebih dahulu')
        return
    }
    if (backingMode.value === 'custom' && customAmount.value < 10000) {
        toast.error('Nominal minimal Rp 10.000')
        return
    }
    showBackingDialog.value = false
    showConfirmDialog.value = true
}

async function confirmBacking() {
    isProcessingPayment.value = true
    try {
        const amount = getBackingAmount()
        const tier = backingMode.value === 'tier' ? getSelectedTier() : null

        await campaignService.createBacking({
            campaign_id: campaign.value.id,
            user_id: 2,
            tier_id: tier ? tier.id : null,
            amount: amount,
            status: 'completed',
        })

        const newAmount = campaign.value.collected_amount + amount
        await campaignService.updateCampaignAmount(campaign.value.id, {
            collected_amount: newAmount,
        })
        campaign.value.collected_amount = newAmount

        if (tier) {
            await campaignService.updateTierQuota(tier.id, {
                remaining_quota: tier.remaining_quota - 1,
            })
        }

        toast.success('Terima kasih! Dukunganmu berhasil dikirim')
        showConfirmDialog.value = false

        fetchTiers(campaign.value.id)
        fetchBackings(campaign.value.id)
    } catch (error) {
        toast.error('Gagal memproses pembayaran, coba lagi')
    } finally {
        isProcessingPayment.value = false
    }
}

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
        <div v-if="isLoading" class="max-w-4xl mx-auto">
            <Skeleton height="16rem" class="mb-6" />
            <Skeleton width="60%" height="2rem" class="mb-2" />
            <Skeleton width="100%" height="4rem" class="mb-6" />

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <Skeleton height="0.75rem" class="mb-2" />
                <Skeleton width="50%" height="1.5rem" />
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <Skeleton width="30%" height="1.5rem" class="mb-4" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton height="6rem" />
                    <Skeleton height="6rem" />
                </div>
            </div>
        </div>

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
                <Button label="Dukung Kampanye Ini" class="w-full mb-6" @click="openBackingDialog" />
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
    <Dialog v-model:visible="showBackingDialog" header="Dukung Kampanye" modal class="w-full max-w-md">
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label class="flex items-center gap-2 cursor-pointer">
                    <RadioButton v-model="backingMode" value="tier" />
                    <span>Pilih Tier Reward</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <RadioButton v-model="backingMode" value="custom" />
                    <span>Nominal Bebas</span>
                </label>
            </div>

            <div v-if="backingMode === 'tier'" class="flex flex-col gap-2">
                <div v-for="tier in tiers" :key="tier.id" class="border rounded-lg p-3 cursor-pointer"
                    :class="selectedTierId === tier.id ? 'border-green-500 bg-green-50' : 'border-gray-200'"
                    @click="tier.remaining_quota > 0 || tier.quota === 0 ? selectedTierId = tier.id : null">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-medium">{{ tier.name }}</p>
                            <p class="text-sm text-gray-500">Min. {{ formatCurrency(tier.min_amount) }}</p>
                        </div>
                        <span v-if="tier.quota > 0 && tier.remaining_quota === 0"
                            class="text-xs text-red-500">Habis</span>
                    </div>
                </div>
                <p v-if="tiers.length === 0" class="text-gray-500 text-sm">Kampanye ini belum punya tier tersedia.</p>
            </div>

            <div v-else class="flex flex-col gap-1">
                <label class="text-sm font-medium">Nominal Donasi (Rp)</label>
                <InputNumber v-model="customAmount" class="w-full" :min="10000" />
                <small class="text-gray-400">Minimal Rp 10.000</small>
            </div>

            <Button label="Lanjutkan" class="mt-2" @click="proceedToConfirm" />
        </div>
    </Dialog>
    <Dialog v-model:visible="showConfirmDialog" header="Konfirmasi Pembayaran" modal class="w-full max-w-md">
        <div class="flex flex-col gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">Kampanye</p>
                <p class="font-medium">{{ campaign?.title }}</p>
            </div>

            <div v-if="backingMode === 'tier'" class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">Tier Dipilih</p>
                <p class="font-medium">{{ getSelectedTier()?.name }}</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">Total Pembayaran</p>
                <p class="text-xl font-bold">{{ formatCurrency(getBackingAmount()) }}</p>
            </div>

            <p class="text-xs text-gray-400">
                Ini adalah simulasi pembayaran (mock). Tidak ada transaksi nyata yang terjadi.
            </p>

            <div class="flex justify-between mt-2">
                <Button label="Kembali" severity="secondary" :disabled="isProcessingPayment"
                    @click="showConfirmDialog = false; showBackingDialog = true" />
                <Button label="Konfirmasi & Bayar" :loading="isProcessingPayment" @click="confirmBacking" />
            </div>
        </div>
    </Dialog>
</template>