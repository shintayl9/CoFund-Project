import { useAuthStore } from '@/stores/useAuthStore'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import CampaignListPage from '@/pages/CampaignListPage.vue'
import CampaignDetailPage from '@/pages/CampaignDetailPage.vue'
import CreateCampaignPage from '@/pages/CreateCampaignPage.vue'
import MyBackingsPage from '@/pages/MyBackingsPage.vue'
import CreatorDashboardPage from '@/pages/CreatorDashboardPage.vue'
import AdminApprovalPage from '@/pages/AdminApprovalPage.vue'
import AdminUsersPage from '@/pages/AdminUsersPage.vue'
import AdminOverviewPage from '@/pages/AdminOverviewPage.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage,
        meta: { guestOnly: true },
    },
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
        meta: { requiresAuth: true },
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
        meta: { requiresAuth: true },
    },
    {
        path: '/dashboard/creator',
        name: 'creator-dashboard',
        component: CreatorDashboardPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/admin/approval',
        name: 'admin-approval',
        component: AdminApprovalPage,
        meta: { requiresAdmin: true },
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: AdminUsersPage,
        meta: { requiresAdmin: true },
    },
    {
        path: '/admin/overview',
        name: 'admin-overview',
        component: AdminOverviewPage,
        meta: { requiresAdmin: true },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
        next('/login')
    } else if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        next('/login')
    } else if (to.meta.guestOnly && authStore.isLoggedIn) {
        next('/campaigns')
    } else {
        next()
    }
})

export default router