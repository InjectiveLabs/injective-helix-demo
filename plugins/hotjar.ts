import Hotjar from 'vue-hotjar'
import { defineNuxtPlugin } from '#imports'
import { VITE_HOTJAR_KEY } from '@/app/utils/constants/setup'

export default defineNuxtPlugin((nuxtApp) => {
  if (VITE_HOTJAR_KEY) {
    nuxtApp.vueApp.use(Hotjar, {
      id: VITE_HOTJAR_KEY
    })
  }
})
