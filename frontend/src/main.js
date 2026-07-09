import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { useAuthStore } from '@/stores/useAuthStore'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

const app = createApp(App)

app.use(createPinia())

const authStore = useAuthStore()
authStore.restoreSession()

app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
})

app.use(Toast)

app.mount('#app')