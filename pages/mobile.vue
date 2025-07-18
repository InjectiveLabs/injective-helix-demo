<script lang="ts" setup>
import {
  HELIX_APP_STORE_LINK,
  HELIX_PLAY_STORE_LINK
} from '@/app/data/marketInfo'
import { MainPage } from '@/types'
// https://apps.apple.com/us/app/helix-trade-with-control/id6737353178?itscg=30200&itsct=apps_box_link&mttnsubad=6737353178
// https://play.google.com/store/apps/details?id=com.injectivelabs.helixmobile

definePageMeta({
  middleware: [
    () => {
      mobileOperatingSystem.value = getMobileOperatingSystem()

      if (mobileOperatingSystem.value === 'iOS') {
        return navigateTo(HELIX_APP_STORE_LINK, { external: true })
      }
      if (mobileOperatingSystem.value === 'Android') {
        return navigateTo(HELIX_PLAY_STORE_LINK, { external: true })
      }

      return navigateTo({ name: MainPage.Index })
    }
  ]
})

const mobileOperatingSystem = ref('')

function getMobileOperatingSystem() {
  // @ts-expect-error - might not actually exist
  const userAgent = navigator.userAgent || navigator?.vendor || window?.opera

  if (/android/i.test(userAgent)) {
    return 'Android'
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  // @ts-expect-error - might not exist
  if (/iPad|iPhone|iPod/.test(userAgent) && !window?.MSStream) {
    return 'iOS'
  }

  return 'unknown'
}
</script>

<template>
  <div />
</template>
