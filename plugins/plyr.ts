import { defineNuxtPlugin } from '#app'
import VuePlyr from '@skjnldsv/vue-plyr'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VuePlyr)
})
