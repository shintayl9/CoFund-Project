function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const authService = {
    async login(credentials) {
        await delay(800)
        console.log('Mock login dengan data:', credentials)
        return { success: true, message: 'Login berhasil' }
    },

    async register(data) {
        await delay(800)
        console.log('Mock register dengan data:', data)
        return { success: true, message: 'Register berhasil' }
    },
}