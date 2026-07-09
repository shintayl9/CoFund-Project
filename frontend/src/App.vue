<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const authStore = useAuthStore()
const hideNavbarRoutes = ['login', 'register']

</script>

<template>
  <Navbar v-if="!hideNavbarRoutes.includes(route.name)" />
  <router-view />
</template>