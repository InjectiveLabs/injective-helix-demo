import Hotjar from 'vue-hotjar'
import { HOTJAR_KEY } from '@shared/utils/constant'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  if (HOTJAR_KEY) {
    nuxtApp.vueApp.use(Hotjar, {
      id: HOTJAR_KEY
    })
  }
})
