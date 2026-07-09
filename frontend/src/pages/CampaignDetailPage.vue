<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import Textarea from 'primevue/textarea'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import InputNumber from 'primevue/inputnumber'
import { campaignService } from '@/services/campaignService'
import { backingService } from '@/services/backingService'
import { tierService } from '@/services/tierService'
import Skeleton from 'primevue/skeleton'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const {
    campaign, tiers, backings, users, updates, isLoading,
    fetchOne, fetchTiers, fetchBackings, fetchUsers, fetchUpdates, postUpdate,
} = useCampaign()

const showBackingDialog = ref(false)
const backingMode = ref('tier')
const selectedTierId = ref(null)
const customAmount = ref(0)
const toast = useToast()

const isOwner = computed(() => campaign.value?.creator_id === authStore.user?.id)
const canBack = computed(() => {
    if (!authStore.isLoggedIn) return false
    if (authStore.user.role === 'admin') return false
    if (isOwner.value) return false
    return true
})

const showUpdateDialog = ref(false)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

async function handleDelete() {
    isDeleting.value = true
    try {
        await campaignService.delete(campaign.value.id)
        toast.success('Kampanye berhasil dihapus')
        router.push('/campaigns')
    } catch (error) {
        toast.error('Gagal menghapus kampanye')
    } finally {
        isDeleting.value = false
        showDeleteConfirm.value = false
    }
}
const updateMessage = ref('')

async function handlePostUpdate() {
    if (!updateMessage.value.trim()) {
        toast.error('Isi update tidak boleh kosong')
        return
    }
    try {
        await postUpdate(campaign.value.id, updateMessage.value)
        toast.success('Update berhasil diposting')
        showUpdateDialog.value = false
        updateMessage.value = ''
    } catch (error) {
        toast.error('Gagal posting update')
    }
}

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

        await backingService.create({
            campaign_id: campaign.value.id,
            user_id: authStore.user.id,
            tier_id: tier ? tier.id : null,
            amount: amount,
            status: 'completed',
        })

        const newAmount = campaign.value.collected_amount + amount
        await campaignService.update(campaign.value.id, {
            collected_amount: newAmount,
        })
        campaign.value.collected_amount = newAmount

        if (tier) {
            await tierService.updateQuota(tier.id, {
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

onMounted(async () => {
    const id = route.params.id
    await fetchOne(id)
    fetchTiers(id)
    fetchBackings(id)
    fetchUsers()
    fetchUpdates(id)

    const isRestricted = campaign.value?.status === 'draft' || campaign.value?.status === 'review'
    const isAllowed = isOwner.value || authStore.user?.role === 'admin'
    if (isRestricted && !isAllowed) {
        toast.error('Kampanye ini belum tersedia untuk publik')
        router.push('/campaigns')
    }
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

function formatDeadline() {
    if (!campaign.value) return ''
    return dayjs(campaign.value.deadline).format('DD MMMM YYYY')
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

            <div class="flex justify-between items-start gap-4 mb-2">
                <h1 class="text-3xl font-bold">{{ campaign.title }}</h1>
                <div class="flex gap-2">
                    <Button v-if="isOwner && campaign.status === 'draft'" label="Edit Kampanye" size="small"
                        severity="secondary" @click="router.push(`/campaigns/${campaign.id}/edit`)" />
                    <Button v-if="isOwner && campaign.status === 'draft'" label="Hapus Kampanye" size="small"
                        severity="danger" @click="showDeleteConfirm = true" />
                    <Button v-if="isOwner && campaign.status === 'active'" label="Post Update" size="small"
                        severity="secondary" @click="showUpdateDialog = true" />
                </div>
            </div>
            <p class="text-gray-600 mb-6">{{ campaign.description }}</p>
            <div v-if="isOwner && campaign.status === 'draft' && campaign.rejection_note"
                class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p class="text-sm font-medium text-red-700">Kampanye ini ditolak admin</p>
                <p class="text-sm text-red-600 mt-1">{{ campaign.rejection_note }}</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-green-500 h-3 rounded-full" :style="{ width: getProgress() + '%' }"></div>
                </div>
                <div class="flex justify-between text-sm mt-2 text-gray-600">
                    <span>{{ getProgress() }}% tercapai</span>
                    <span>{{ getDaysLeft() }}</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">Deadline: {{ formatDeadline() }}</p>
                <p class="text-xl font-semibold mt-2">
                    {{ formatCurrency(campaign.collected_amount) }}
                    <span class="text-gray-400 font-normal text-base">/ target {{ formatCurrency(campaign.target_amount)
                    }}</span>
                </p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <Button v-if="canBack" label="Dukung Kampanye Ini" class="w-full mb-6" @click="openBackingDialog" />
                <Button v-else-if="!authStore.isLoggedIn" label="Login untuk Mendukung" class="w-full mb-6"
                    severity="secondary" @click="router.push('/login')" />
                <h2 class="text-xl font-semibold mb-4">Pilihan Tier</h2>
                <div v-if="tiers.length === 0" class="text-gray-500">Belum ada tier untuk kampanye ini.</div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="tier in tiers" :key="tier.id" class="border rounded-lg p-4">
                        <h3 class="font-semibold">{{ tier.name }}</h3>
                        <p class="text-sm text-gray-500 mt-1">{{ tier.description }}</p>
                        <p class="text-sm font-medium mt-2">Minimal {{ formatCurrency(tier.min_amount) }}</p>
                        <p class="text-xs text-gray-400 mt-1">
                            Terisi: {{ tier.quota - tier.remaining_quota }} / {{ tier.quota }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-semibold mb-4">Update Kampanye</h2>
                <div v-if="updates.length === 0" class="text-gray-500">Belum ada update dari creator.</div>
                <ul v-else class="flex flex-col gap-3">
                    <li v-for="update in updates" :key="update.id" class="border-l-4 border-green-500 pl-3">
                        <p class="text-sm text-gray-800">{{ update.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ update.created_at }}</p>
                    </li>
                </ul>
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

    <Dialog v-model:visible="showUpdateDialog" header="Post Update Kampanye" modal class="w-full max-w-md">
        <div class="flex flex-col gap-3">
            <label class="text-sm font-medium">Isi Update</label>
            <Textarea v-model="updateMessage" rows="4" placeholder="Tulis update terbaru untuk backer..."
                class="w-full" />
            <div class="flex justify-end gap-2 mt-2">
                <Button label="Batal" severity="secondary" @click="showUpdateDialog = false" />
                <Button label="Posting" @click="handlePostUpdate" />
            </div>
        </div>
    </Dialog>
    <Dialog v-model:visible="showDeleteConfirm" header="Hapus Kampanye?" modal class="w-full max-w-md">
        <div class="flex flex-col gap-4">
            <p class="text-gray-600">
                Kampanye <strong>"{{ campaign?.title }}"</strong> akan dihapus permanen dan tidak bisa dikembalikan.
                Yakin mau lanjut?
            </p>
            <div class="flex justify-end gap-2">
                <Button label="Batal" severity="secondary" :disabled="isDeleting" @click="showDeleteConfirm = false" />
                <Button label="Ya, Hapus" severity="danger" :loading="isDeleting" @click="handleDelete" />
            </div>
        </div>
    </Dialog>
</template>