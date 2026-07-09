<script setup>
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { campaignService } from '@/services/campaignService'
import { useAuthStore } from '@/stores/useAuthStore'
import { tierService } from '@/services/tierService'
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import dayjs from 'dayjs'

const currentStep = ref(1)

const categoryOptions = [
    { label: 'Kuliner', value: 1 },
    { label: 'Lingkungan', value: 2 },
    { label: 'Teknologi', value: 3 },
    { label: 'Pendidikan', value: 4 },
]

const minDeadline = dayjs().add(7, 'day').toDate()

const schema = yup.object({
    title: yup.string().max(100, 'Maksimal 100 karakter').required('Judul wajib diisi'),
    categoryId: yup.number().required('Kategori wajib dipilih'),
    description: yup.string().required('Deskripsi wajib diisi'),
    targetAmount: yup
        .number()
        .min(100000, 'Target dana minimal Rp 100.000')
        .required('Target dana wajib diisi'),
    deadline: yup
        .date()
        .min(minDeadline, 'Deadline minimal 7 hari dari sekarang')
        .required('Deadline wajib diisi'),
    image: yup.string().url('Harus berupa URL yang valid').required('URL gambar wajib diisi'),
    videoUrl: yup.string().url('Harus berupa URL yang valid').notRequired(),
})

const { handleSubmit, validateField } = useForm({
    validationSchema: schema,
})

const { value: title, errorMessage: titleError } = useField('title')
const { value: categoryId, errorMessage: categoryIdError } = useField('categoryId')
const { value: description, errorMessage: descriptionError } = useField('description')
const { value: targetAmount, errorMessage: targetAmountError } = useField('targetAmount')
const { value: deadline, errorMessage: deadlineError } = useField('deadline')
const { value: image, errorMessage: imageError } = useField('image')
const { value: videoUrl, errorMessage: videoUrlError } = useField('videoUrl')

async function goToStep2() {
    const step1Fields = ['title', 'categoryId', 'description']
    const results = await Promise.all(step1Fields.map((field) => validateField(field)))
    const isValid = results.every((r) => r.valid)
    if (isValid) {
        currentStep.value = 2
    }
}

function goToStep1() {
    currentStep.value = 1
}

const tiers = ref([])

function addTier() {
    tiers.value.push({
        name: '',
        minAmount: 0,
        quota: 0,
        description: '',
    })
}

function removeTier(index) {
    tiers.value.splice(index, 1)
}

function goToStep4() {
    currentStep.value = 4
}

const toast = useToast()
const router = useRouter()
const isSubmitting = ref(false)
const authStore = useAuthStore()

function formatDateForSubmit(date) {
    return dayjs(date).format('YYYY-MM-DD')
}

const onSubmit = handleSubmit(async (values) => {
    if (tiers.value.length === 0) {
        toast.error('Kampanye wajib memiliki minimal 1 tier')
        currentStep.value = 3
        return
    }

    isSubmitting.value = true
    try {
        const campaignRes = await campaignService.create({
            title: values.title,
            slug: values.title.toLowerCase().replace(/\s+/g, '-'),
            description: values.description,
            target_amount: values.targetAmount,
            collected_amount: 0,
            deadline: formatDateForSubmit(values.deadline),
            status: 'draft',
            category_id: values.categoryId,
            creator_id: authStore.user.id,
            image: values.image,
        })

        const newCampaignId = campaignRes.data.id

        await Promise.all(
            tiers.value.map((tier) =>
                tierService.create({
                    campaign_id: newCampaignId,
                    name: tier.name,
                    min_amount: tier.minAmount,
                    quota: tier.quota,
                    remaining_quota: tier.quota,
                    description: tier.description,
                })
            )
        )

        toast.success('Kampanye berhasil dibuat!')
        router.push(`/campaigns/${newCampaignId}`)
    } catch (error) {
        toast.error('Gagal membuat kampanye, coba lagi')
    } finally {
        isSubmitting.value = false
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 class="text-2xl font-bold mb-2">Buat Kampanye Baru</h1>
            <p class="text-gray-500 mb-6">Langkah {{ currentStep }} dari 4</p>

            <div v-if="currentStep === 1" class="flex flex-col gap-4">
                <h2 class="font-semibold text-lg">Info Dasar</h2>

                <div class="flex flex-col gap-1">
                    <label for="title" class="text-sm font-medium">Judul Kampanye</label>
                    <InputText id="title" v-model="title" placeholder="Judul kampanye" class="w-full" />
                    <small v-if="titleError" class="text-red-500">{{ titleError }}</small>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="category" class="text-sm font-medium">Kategori</label>
                    <Select id="category" v-model="categoryId" :options="categoryOptions" optionLabel="label"
                        optionValue="value" placeholder="Pilih kategori" class="w-full" />
                    <small v-if="categoryIdError" class="text-red-500">{{ categoryIdError }}</small>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="description" class="text-sm font-medium">Deskripsi</label>
                    <Textarea id="description" v-model="description" rows="5" class="w-full" />
                    <small v-if="descriptionError" class="text-red-500">{{ descriptionError }}</small>
                </div>

                <Button label="Selanjutnya" class="mt-4 self-end" @click="goToStep2" />
            </div>
            <div v-if="currentStep === 2" class="flex flex-col gap-4">
                <h2 class="font-semibold text-lg">Target & Media</h2>

                <div class="flex flex-col gap-1">
                    <label for="targetAmount" class="text-sm font-medium">Target Dana (Rp)</label>
                    <InputNumber id="targetAmount" v-model="targetAmount" placeholder="Minimal Rp 100.000"
                        class="w-full" :min="0" />
                    <small v-if="targetAmountError" class="text-red-500">{{ targetAmountError }}</small>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="deadline" class="text-sm font-medium">Deadline</label>
                    <DatePicker id="deadline" v-model="deadline" placeholder="Pilih tanggal" class="w-full"
                        dateFormat="dd/mm/yy" />
                    <small v-if="deadlineError" class="text-red-500">{{ deadlineError }}</small>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="image" class="text-sm font-medium">URL Gambar</label>
                    <InputText id="image" v-model="image" placeholder="https://..." class="w-full" />
                    <small v-if="imageError" class="text-red-500">{{ imageError }}</small>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="videoUrl" class="text-sm font-medium">URL Video (opsional)</label>
                    <InputText id="videoUrl" v-model="videoUrl" placeholder="https://youtube.com/..." class="w-full" />
                    <small v-if="videoUrlError" class="text-red-500">{{ videoUrlError }}</small>
                </div>

                <div class="flex justify-between mt-4">
                    <Button label="Kembali" severity="secondary" @click="goToStep1" />
                    <Button label="Selanjutnya" @click="currentStep = 3" />
                </div>
            </div>
            <div v-if="currentStep === 3" class="flex flex-col gap-4">
                <div class="flex justify-between items-center">
                    <h2 class="font-semibold text-lg">Kelola Tier</h2>
                    <Button label="+ Tambah Tier" severity="secondary" size="small" @click="addTier" />
                </div>

                <p v-if="tiers.length === 0" class="text-gray-500 text-sm">
                    Belum ada tier. Kampanye wajib memiliki minimal 1 tier.
                </p>

                <div v-for="(tier, index) in tiers" :key="index"
                    class="border rounded-lg p-4 flex flex-col gap-3 relative">
                    <Button icon="pi pi-times" severity="danger" text size="small" class="!absolute top-2 right-2"
                        @click="removeTier(index)" />

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium">Nama Tier</label>
                        <InputText v-model="tier.name" placeholder="Contoh: Early Bird" class="w-full" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium">Minimal Nominal (Rp)</label>
                        <InputNumber v-model="tier.minAmount" class="w-full" :min="0" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium">Kuota (0 = tidak terbatas)</label>
                        <InputNumber v-model="tier.quota" class="w-full" :min="0" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium">Deskripsi Reward</label>
                        <Textarea v-model="tier.description" rows="2" class="w-full" />
                    </div>
                </div>

                <div class="flex justify-between mt-4">
                    <Button label="Kembali" severity="secondary" @click="currentStep = 2" />
                    <Button label="Selanjutnya" @click="goToStep4" />
                </div>
            </div>
            <div v-if="currentStep === 4" class="flex flex-col gap-4">
                <h2 class="font-semibold text-lg">Preview Kampanye</h2>

                <div class="border rounded-lg p-4">
                    <img :src="image" class="w-full h-48 object-cover rounded mb-4" />
                    <h3 class="text-xl font-bold">{{ title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ description }}</p>

                    <div class="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                            <span class="text-gray-500">Target Dana</span>
                            <p class="font-medium">Rp {{ targetAmount?.toLocaleString('id-ID') }}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">Deadline</span>
                            <p class="font-medium">{{ deadline ? dayjs(deadline).format('DD MMM YYYY') : '-' }}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="font-medium mb-2">Tier ({{ tiers.length }})</h3>
                    <div class="flex flex-col gap-2">
                        <div v-for="(tier, index) in tiers" :key="index" class="border rounded-lg p-3 text-sm">
                            <p class="font-medium">{{ tier.name }}</p>
                            <p class="text-gray-500">Min. Rp {{ tier.minAmount?.toLocaleString('id-ID') }} — Kuota {{
                                tier.quota }}</p>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between mt-4">
                    <Button label="Kembali" severity="secondary" @click="currentStep = 3" :disabled="isSubmitting" />
                    <Button label="Submit Kampanye" @click="onSubmit" :loading="isSubmitting" />
                </div>
            </div>
        </div>
    </div>
</template>