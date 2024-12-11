<script setup lang="ts">
import { getBridgeRedirectionUrl } from '@/app/utils/network'
import { TradeSubPage } from '@/types'

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    gsap.from('#hero-section', {
      opacity: 0,
      filter: 'blur(10px)',
      duration: 2,
      delay: 0.2,
      scale: 1.2
    })

    gsap.utils.toArray('.gsap-text').forEach((text, _i, arr) => {
      gsap.to(text as HTMLElement, {
        scrollTrigger: {
          trigger: text as HTMLElement,
          start: '50px 40%',
          end: 'bottom 0%',
          scrub: 2
        },
        y: arr.length * -40,
        scale: 1.2,
        filter: 'blur(10px)',
        opacity: 0,
        duration: 1
      })
    })
  })
})
</script>

<template>
  <div
    class="lg:h-screen flex flex-col lg:justify-center max-lg:py-10 relative gsap-section"
  >
    <div id="hero-section" class="max-w-4xl mx-auto w-full text-center">
      <h1
        id="hero-title"
        class="text-2xl lg:text-6xl font-semibold gsap-text mb-5"
      >
        <span class="">
          {{ $t('home.openFinance') + ' ' }}
        </span>
        <span class="relative text-blue-500">
          {{ $t('home.reimagined') }}
        </span>
      </h1>

      <p id="hero-description" class="text-lg gsap-text">
        {{ $t('home.description') }}
      </p>

      <div class="flex justify-center gap-4 mt-10 gsap-text">
        <NuxtLink
          :to="{ name: TradeSubPage.Spot, params: { slug: 'inj-usdt' } }"
        >
          <AppButton class="lg:py-4 w-full">
            {{ $t('home.startTrading') }}
          </AppButton>
        </NuxtLink>

        <NuxtLink :to="getBridgeRedirectionUrl()" target="_blank">
          <AppButton class="lg:py-4 w-full" variant="primary-outline">
            {{ $t('home.depositCrypto') }}
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
