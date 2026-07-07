<script setup>
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const hideNavbarRoutes = ['login', 'register']
</script>

<template>
  <Navbar v-if="!hideNavbarRoutes.includes(route.name)" />
  <router-view />
</template>