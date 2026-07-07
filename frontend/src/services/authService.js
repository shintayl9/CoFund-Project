import api from './api'

export const authService = {
    async login(credentials) {
        const res = await api.get('/users', { params: { email: credentials.email } })
        const user = res.data[0]

        if (!user || user.password !== credentials.password) {
            throw new Error('Email atau password salah')
        }
        if (user.is_suspended) {
            throw new Error('Akun kamu telah di-suspend')
        }

        return { success: true, message: `Selamat datang, ${user.name}!`, user }
    },

    async register(data) {
        const existing = await api.get('/users', { params: { email: data.email } })
        if (existing.data.length > 0) {
            throw new Error('Email sudah terdaftar')
        }

        const res = await api.post('/users', {
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'backer',
            balance: 0,
            is_suspended: false,
        })

        return { success: true, message: 'Register berhasil', user: res.data }
    },
}