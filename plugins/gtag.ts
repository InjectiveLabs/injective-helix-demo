import VueGtag from 'vue-gtag'
import { VITE_GOOGLE_ANALYTICS_KEY } from '@/app/utils/constants'

export default defineNuxtPlugin((nuxtApp) => {
  if (VITE_GOOGLE_ANALYTICS_KEY) {
    nuxtApp.vueApp.use(VueGtag, {
      config: {
        id: VITE_GOOGLE_ANALYTICS_KEY
      }
    })
  }
})
