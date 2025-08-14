<script lang="ts" setup>
import { metaTags } from '@/nuxt-config/meta'

const siteFullUrl = useRequestURL()
const { lg } = useSharedBreakpoints()

const mobileUrl = computed(() => `${siteFullUrl.origin || metaTags.url}/mobile`)

function goToMobileSection() {
  const target = document.querySelector('#mobile-section')

  if (target) {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: target, offsetY: lg.value ? 100 : 135 }
    })
  }
}
</script>

<template>
  <div
    class="py-3.5 px-5 flex items-center gap-4 border border-white rounded-2xl max-w-96 cursor-pointer hover:bg-white/10 transition-colors"
    @click="goToMobileSection"
  >
    <PartialsCommonHelixQRCode
      v-bind="{ qrLink: mobileUrl }"
      class="rounded-lg lg:w-24 lg:min-w-24 w-20 min-w-20 !p-1"
    />

    <span class="font-medium text-left">
      {{ $t('home.downloadHelixMobile') }}
    </span>
  </div>
</template>
