import VueGtag from 'vue-gtag'
import { GOOGLE_ANALYTICS_KEY } from '@/app/utils/constants'

export default defineNuxtPlugin((nuxtApp) => {
  if (GOOGLE_ANALYTICS_KEY) {
    nuxtApp.vueApp.use(VueGtag, {
      config: {
        id: GOOGLE_ANALYTICS_KEY
      }
    })
  }
})
