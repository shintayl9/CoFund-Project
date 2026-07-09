<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { campaignService } from '@/services/campaignService'
import { useToast } from 'vue-toastification'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import Skeleton from 'primevue/skeleton'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { campaign, isLoading, fetchOne } = useCampaign()

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
})

const { handleSubmit, setValues } = useForm({
    validationSchema: schema,
})

const { value: title, errorMessage: titleError } = useField('title')
const { value: categoryId, errorMessage: categoryIdError } = useField('categoryId')
const { value: description, errorMessage: descriptionError } = useField('description')
const { value: targetAmount, errorMessage: targetAmountError } = useField('targetAmount')
const { value: deadline, errorMessage: deadlineError } = useField('deadline')
const { value: image, errorMessage: imageError } = useField('image')

const isSubmitting = ref(false)

onMounted(async () => {
    const id = route.params.id
    await fetchOne(id)

    const isOwner = campaign.value?.creator_id === authStore.user?.id
    const isDraft = campaign.value?.status === 'draft'

    if (!campaign.value || !isOwner || !isDraft) {
        toast.error('Kampanye ini tidak bisa diedit')
        router.push(`/campaigns/${id}`)
        return
    }

    setValues({
        title: campaign.value.title,
        categoryId: campaign.value.category_id,
        description: campaign.value.description,
        targetAmount: campaign.value.target_amount,
        deadline: dayjs(campaign.value.deadline).toDate(),
        image: campaign.value.image,
    })
})

const onSubmit = handleSubmit(async (values) => {
    isSubmitting.value = true
    try {
        await campaignService.update(campaign.value.id, {
            title: values.title,
            slug: values.title.toLowerCase().replace(/\s+/g, '-'),
            category_id: values.categoryId,
            description: values.description,
            target_amount: values.targetAmount,
            deadline: dayjs(values.deadline).format('YYYY-MM-DD'),
            image: values.image,
        })
        toast.success('Kampanye berhasil diperbarui')
        router.push(`/campaigns/${campaign.value.id}`)
    } catch (error) {
        toast.error('Gagal memperbarui kampanye, coba lagi')
    } finally {
        isSubmitting.value = false
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 class="text-2xl font-bold mb-6">Edit Kampanye</h1>

            <div v-if="isLoading" class="flex flex-col gap-4">
                <Skeleton height="2.5rem" />
                <Skeleton height="2.5rem" />
                <Skeleton height="6rem" />
                <Skeleton height="2.5rem" />
            </div>

            <div v-else class="flex flex-col gap-4">
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

                <div class="flex flex-col gap-1">
                    <label for="targetAmount" class="text-sm font-medium">Target Dana (Rp)</label>
                    <InputNumber id="targetAmount" v-model="targetAmount" class="w-full" :min="0" />
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

                <div class="flex justify-between mt-4">
                    <Button label="Batal" severity="secondary" :disabled="isSubmitting"
                        @click="router.push(`/campaigns/${campaign.id}`)" />
                    <Button label="Simpan Perubahan" @click="onSubmit" :loading="isSubmitting" />
                </div>
            </div>
        </div>
    </div>
</template>