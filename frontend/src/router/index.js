import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'

const routes = [
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterPage,
    },
    {
        path: '/login-success',
        name: 'login-success',
        component: {
            template: '<div class="p-8 text-2xl">Login berhasil! (halaman dummy sementara)</div>',
        },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router