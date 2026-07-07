import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
        isAdmin: (state) => state.user?.role === 'admin',
    },
    actions: {
        setUser(userData) {
            this.user = userData
            localStorage.setItem('cofund_user', JSON.stringify(userData))
        },
        logout() {
            this.user = null
            localStorage.removeItem('cofund_user')
        },
        restoreSession() {
            const saved = localStorage.getItem('cofund_user')
            if (saved) {
                this.user = JSON.parse(saved)
            }
        },
    },
})