import { defineNuxtPlugin } from '#imports'
import { MIXPANEL_KEY } from '@/app/utils/constants'
import { mixpanelEvents } from '@/app/providers/mixpanel/TrackingEvents'

export default defineNuxtPlugin(() => {
  if (MIXPANEL_KEY) {
    mixpanelEvents.init(MIXPANEL_KEY)
  }
})
