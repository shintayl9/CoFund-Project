import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import CampaignListPage from '@/pages/CampaignListPage.vue'
import CampaignDetailPage from '@/pages/CampaignDetailPage.vue'

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
        path: '/campaigns',
        name: 'campaigns',
        component: CampaignListPage,
    },
    {
        path: '/campaigns/:id',
        name: 'campaign-detail',
        component: CampaignDetailPage,
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