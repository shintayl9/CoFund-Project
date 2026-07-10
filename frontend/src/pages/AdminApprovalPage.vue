<script setup>
import { onMounted, ref } from 'vue'
import { useAdminApproval } from '@/composables/useAdminApproval'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'

const {
    reviewCampaigns, cancellationRequests, isLoading,
    fetchReviewCampaigns, fetchCancellationRequests,
    approveCampaign, rejectCampaign, approveCancellation, extendDeadline,
} = useAdminApproval()
const toast = useToast()

const showRejectDialog = ref(false)
const rejectingCampaignId = ref(null)
const rejectReason = ref('')

const showExtendDialog = ref(false)
const extendingCampaignId = ref(null)
const newDeadline = ref(null)

onMounted(() => {
    fetchReviewCampaigns()
    fetchCancellationRequests()
})

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function formatDeadline(deadline) {
    return dayjs(deadline).format('DD MMMM YYYY')
}

async function handleApprove(campaignId) {
    try {
        await approveCampaign(campaignId)
        toast.success('Kampanye berhasil disetujui')
    } catch (error) {
        toast.error('Gagal menyetujui kampanye')
    }
}

function openRejectDialog(campaignId) {
    rejectingCampaignId.value = campaignId
    rejectReason.value = ''
    showRejectDialog.value = true
}

async function handleReject() {
    if (!rejectReason.value.trim()) {
        toast.error('Catatan alasan penolakan wajib diisi')
        return
    }
    try {
        await rejectCampaign(rejectingCampaignId.value, rejectReason.value)
        toast.success('Kampanye ditolak dan dikembalikan ke creator')
        showRejectDialog.value = false
    } catch (error) {
        toast.error('Gagal menolak kampanye')
    }
}

async function handleApproveCancellation(campaignId) {
    try {
        await approveCancellation(campaignId)
        toast.success('Pembatalan disetujui, dana backer telah dikembalikan')
    } catch (error) {
        toast.error('Gagal memproses pembatalan')
    }
}

function openExtendDialog(campaignId) {
    extendingCampaignId.value = campaignId
    newDeadline.value = null
    showExtendDialog.value = true
}

async function handleExtendDeadline() {
    if (!newDeadline.value) {
        toast.error('Pilih tanggal deadline baru')
        return
    }
    try {
        await extendDeadline(extendingCampaignId.value, dayjs(newDeadline.value).format('YYYY-MM-DD'))
        toast.success('Deadline berhasil diperpanjang')
        showExtendDialog.value = false
    } catch (error) {
        toast.error('Gagal memperpanjang deadline')
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-3xl mx-auto flex flex-col gap-10">
            <div>
                <h1 class="text-2xl font-bold mb-6">Approval Queue</h1>

                <div v-if="isLoading" class="text-gray-500">Memuat data...</div>

                <div v-else-if="reviewCampaigns.length === 0" class="text-gray-500">
                    Tidak ada kampanye yang menunggu review.
                </div>

                <div v-else class="flex flex-col gap-4">
                    <div v-for="c in reviewCampaigns" :key="c.id" class="bg-white rounded-lg shadow-md p-4 flex gap-4">
                        <img :src="c.image" class="w-24 h-24 object-cover rounded-lg flex-shrink-0" />

                        <div class="flex-1">
                            <h2 class="font-semibold">{{ c.title }}</h2>
                            <p class="text-sm text-gray-500 line-clamp-2 mt-1">{{ c.description }}</p>
                            <p class="text-sm font-medium mt-2">Target: {{ formatCurrency(c.target_amount) }}</p>

                            <div class="flex gap-2 mt-3">
                                <Button label="Approve" size="small" @click="handleApprove(c.id)" />
                                <Button label="Reject" size="small" severity="danger" @click="openRejectDialog(c.id)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h1 class="text-2xl font-bold mb-6">Permintaan Pembatalan</h1>

                <div v-if="cancellationRequests.length === 0" class="text-gray-500">
                    Tidak ada permintaan pembatalan kampanye.
                </div>

                <div v-else class="flex flex-col gap-4">
                    <div v-for="c in cancellationRequests" :key="c.id"
                        class="bg-white rounded-lg shadow-md p-4 flex gap-4">
                        <img :src="c.image" class="w-24 h-24 object-cover rounded-lg flex-shrink-0" />

                        <div class="flex-1">
                            <h2 class="font-semibold">{{ c.title }}</h2>
                            <p class="text-sm text-gray-500 mt-1">Deadline saat ini: {{ formatDeadline(c.deadline) }}
                            </p>
                            <div class="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                                <p class="text-xs font-medium text-yellow-700">Alasan pembatalan dari creator:</p>
                                <p class="text-sm text-yellow-700">{{ c.cancellation_reason }}</p>
                            </div>

                            <div class="flex gap-2 mt-3">
                                <Button label="Setujui Pembatalan" size="small" severity="danger"
                                    @click="handleApproveCancellation(c.id)" />
                                <Button label="Perpanjang Deadline" size="small" severity="secondary"
                                    @click="openExtendDialog(c.id)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="showRejectDialog" header="Tolak Kampanye" modal class="w-full max-w-md">
            <div class="flex flex-col gap-3">
                <label class="text-sm font-medium">Alasan Penolakan</label>
                <Textarea v-model="rejectReason" rows="4" placeholder="Jelaskan alasan penolakan..." class="w-full" />
                <div class="flex justify-end gap-2 mt-2">
                    <Button label="Batal" severity="secondary" @click="showRejectDialog = false" />
                    <Button label="Tolak Kampanye" severity="danger" @click="handleReject" />
                </div>
            </div>
        </Dialog>

        <Dialog v-model:visible="showExtendDialog" header="Perpanjang Deadline Kampanye" modal class="w-full max-w-md">
            <div class="flex flex-col gap-3">
                <p class="text-sm text-gray-600">
                    Pilih deadline baru untuk kampanye ini. Kampanye akan tetap berstatus <strong>active</strong> dan
                    permintaan pembatalan dari creator akan ditolak.
                </p>
                <label class="text-sm font-medium">Deadline Baru</label>
                <DatePicker v-model="newDeadline" placeholder="Pilih tanggal" class="w-full" dateFormat="dd/mm/yy" />
                <div class="flex justify-end gap-2 mt-2">
                    <Button label="Batal" severity="secondary" @click="showExtendDialog = false" />
                    <Button label="Perpanjang Deadline" @click="handleExtendDeadline" />
                </div>
            </div>
        </Dialog>
    </div>
</template>