<script setup>
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { ref } from 'vue'

const isLoading = ref(false)
const isSubmitted = ref(false)

const schema = yup.object({
    email: yup.string().email('Format email tidak valid').required('Email wajib diisi'),
})

const { handleSubmit } = useForm({
    validationSchema: schema,
})

const { value: email, errorMessage: emailError } = useField('email')

const onSubmit = handleSubmit(async () => {
    isLoading.value = true
    // Simulasi pengiriman email (FE-only, tidak ada backend/SMTP sungguhan)
    await new Promise((resolve) => setTimeout(resolve, 800))
    isLoading.value = false
    isSubmitted.value = true
})
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="p-8 bg-white rounded-lg shadow-md w-96">
            <router-link to="/" class="font-bold text-lg text-green-600 mb-4 block">CoFund</router-link>

            <div v-if="!isSubmitted">
                <h1 class="text-2xl font-bold">Lupa Password?</h1>
                <p class="text-sm text-gray-500 mb-6">Masukkan email kamu, kami akan kirim link untuk reset
                    password</p>

                <form @submit="onSubmit" class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1">
                        <label for="email" class="text-sm font-medium">Email</label>
                        <InputText id="email" v-model="email" placeholder="nama@email.com" autocomplete="email" />
                        <small v-if="emailError" class="text-red-500">{{ emailError }}</small>
                    </div>

                    <Button type="submit" label="Kirim Link Reset" class="mt-2" :loading="isLoading" />
                </form>
            </div>

            <div v-else class="text-center">
                <div
                    class="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-check text-2xl"></i>
                </div>
                <h1 class="text-xl font-bold mb-2">Link Terkirim</h1>
                <p class="text-sm text-gray-500 mb-6">
                    Link reset password telah dikirim ke <strong>{{ email }}</strong>.
                </p>
            </div>

            <p class="text-sm text-center mt-4 text-gray-600">
                <router-link to="/login" class="text-green-600 font-medium hover:underline">
                    Kembali ke Login
                </router-link>
            </p>
        </div>
    </div>
</template>