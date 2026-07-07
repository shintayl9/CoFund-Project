import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import CampaignListPage from '@/pages/CampaignListPage.vue'
import CampaignDetailPage from '@/pages/CampaignDetailPage.vue'
import CreateCampaignPage from '@/pages/CreateCampaignPage.vue'
import MyBackingsPage from '@/pages/MyBackingsPage.vue'
import CreatorDashboardPage from '@/pages/CreatorDashboardPage.vue'
import AdminApprovalPage from '@/pages/AdminApprovalPage.vue'
import AdminUsersPage from '@/pages/AdminUsersPage.vue'

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
        path: '/campaigns/create',
        name: 'campaign-create',
        component: CreateCampaignPage,
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
    {
        path: '/my-backings',
        name: 'my-backings',
        component: MyBackingsPage,
    },
    {
        path: '/dashboard/creator',
        name: 'creator-dashboard',
        component: CreatorDashboardPage,
    },
    {
        path: '/admin/approval',
        name: 'admin-approval',
        component: AdminApprovalPage,
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: AdminUsersPage,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router