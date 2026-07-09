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

const toast = useToast();
const router = useRouter();
const isLoading = ref(false);

const schema = yup.object({
  name: yup.string().required("Nama wajib diisi"),
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  password: yup
    .string()
    .min(8, "Password minimal 8 karakter")
    .required("Password wajib diisi"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Konfirmasi password tidak cocok")
    .required("Konfirmasi password wajib diisi"),
});

const { handleSubmit } = useForm({
  validationSchema: schema,
});

const { value: name, errorMessage: nameError } = useField("name");
const { value: email, errorMessage: emailError } = useField("email");
const { value: password, errorMessage: passwordError } = useField("password");
const { value: confirmPassword, errorMessage: confirmPasswordError } =
  useField("confirmPassword");

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    const res = await authService.register(values);
    toast.success(res.message);
    router.push("/login");
  } catch (error) {
    toast.error(error.message || "Register gagal, coba lagi");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="p-8 bg-white rounded-lg shadow-md w-96">
      <router-link to="/" class="font-bold text-lg text-green-600 mb-4 block">CoFund</router-link>
      <h1 class="text-2xl font-bold">Mulai Langkahmu di CoFund</h1>
      <p class="text-sm text-gray-500 mb-6">Daftar sekarang dan jadi bagian dari gerakan pendanaan kolektif</p>

      <form @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium">Nama</label>
          <InputText id="name" v-model="name" placeholder="Nama lengkap" class="w-full" autocomplete="name" />
          <small v-if="nameError" class="text-red-500">{{ nameError }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <InputText id="email" v-model="email" placeholder="nama@email.com" class="w-full" autocomplete="email" />
          <small v-if="emailError" class="text-red-500">{{ emailError }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium">Password</label>
          <Password id="password" v-model="password" toggleMask placeholder="Minimal 8 karakter" class="w-full"
            inputClass="w-full" autocomplete="new-password" />
          <small v-if="passwordError" class="text-red-500">{{
            passwordError
          }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="confirmPassword" class="text-sm font-medium">Konfirmasi Password</label>
          <Password id="confirmPassword" v-model="confirmPassword" :feedback="false" toggleMask
            placeholder="Ulangi password" class="w-full" inputClass="w-full" autocomplete="new-password" />
          <small v-if="confirmPasswordError" class="text-red-500">{{
            confirmPasswordError
          }}</small>
        </div>

        <Button type="submit" label="Register" class="mt-2" :loading="isLoading" />
      </form>
      <p class="text-sm text-center mt-4 text-gray-600">
        Sudah punya akun?
        <router-link to="/login" class="text-blue-600 font-medium hover:underline">
          Login di sini
        </router-link>
      </p>
    </div>
  </div>
</template>
