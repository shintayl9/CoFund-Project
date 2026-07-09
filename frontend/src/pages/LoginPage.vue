<script setup>
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { useToast } from "vue-toastification";
import { authService } from "@/services/authService";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/useAuthStore'

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

const schema = yup.object({
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  password: yup
    .string()
    .min(8, "Password minimal 8 karakter")
    .required("Password wajib diisi"),
});

const { handleSubmit } = useForm({
  validationSchema: schema,
});

const { value: email, errorMessage: emailError } = useField("email");
const { value: password, errorMessage: passwordError } = useField("password");

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    const res = await authService.login(values);
    authStore.setUser(res.user);
    toast.success(res.message);

    if (res.user.role === 'admin') {
      router.push("/admin/approval");
    } else if (res.user.role === 'creator') {
      router.push("/dashboard/creator");
    } else {
      router.push("/campaigns");
    }
  } catch (error) {
    toast.error(error.message || "Login gagal, coba lagi");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="p-8 bg-white rounded-lg shadow-md w-96">
      <router-link to="/" class="font-bold text-lg text-green-600 mb-4 block">CoFund</router-link>
      <h1 class="text-2xl font-bold">Selamat Datang Kembali</h1>
      <p class="text-sm text-gray-500 mb-6">Masuk untuk melanjutkan dukunganmu terhadap ide-ide hebat</p>
      <h1 class="text-2xl font-bold mb-6">Login</h1>

      <form @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <InputText id="email" v-model="email" placeholder="nama@email.com" autocomplete="email" />
          <small v-if="emailError" class="text-red-500">{{ emailError }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium">Password</label>
          <Password id="password" v-model="password" :feedback="false" toggleMask placeholder="Minimal 8 karakter"
            class="w-full" inputClass="w-full" autocomplete="current-password" />
          <small v-if="passwordError" class="text-red-500">{{
            passwordError
          }}</small>
        </div>

        <Button type="submit" label="Login" class="mt-2" :loading="isLoading" />
      </form>
      <p class="text-sm text-center mt-4 text-gray-600">
        Belum punya akun?
        <router-link to="/register" class="text-blue-600 font-medium hover:underline">
          Register di sini
        </router-link>
      </p>
    </div>
  </div>
</template>
