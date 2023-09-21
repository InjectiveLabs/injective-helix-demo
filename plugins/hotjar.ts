import Hotjar from 'vue-hotjar'
import { defineNuxtPlugin } from '#imports'
import { HOTJAR_KEY } from '@/app/utils/constants/setup'

export default defineNuxtPlugin((nuxtApp) => {
  if (HOTJAR_KEY) {
    nuxtApp.vueApp.use(Hotjar, {
      id: HOTJAR_KEY
    })
  }
})
