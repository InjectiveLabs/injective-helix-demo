import { init } from '@amplitude/analytics-browser'
import { defineNuxtPlugin } from '#imports'
import { AMPLITUDE_KEY } from '@/app/utils/constants'

export default defineNuxtPlugin(() => {
  if (AMPLITUDE_KEY) {
    init(AMPLITUDE_KEY)
  }
})
