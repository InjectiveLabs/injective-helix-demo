<script setup lang="ts">
// import { ZERO_IN_BASE } from '@shared/utils/constant'
// import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { getBridgeRedirectionUrl } from '@/app/utils/network'
import { TradeSubPage } from '@/types'

// const spotStore = useSpotStore()
// const derivativeStore = useDerivativeStore()

// const totalVolume = computed(() =>
//   [...spotStore.marketsSummary, ...derivativeStore.marketsSummary].reduce(
//     (sum, market) => {
//       return sum.plus(market.volume || 0)
//     },
//     ZERO_IN_BASE
//   )
// )

// const totalMarkets = computed(
//   () =>
//     [...spotStore.activeMarketIds, ...derivativeStore.activeMarketIds].length
// )

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
    class="lg:min-h-screen flex flex-col lg:justify-center max-lg:py-10 relative"
  >
    <AppBlur
      class="max-lg:hidden absolute top-[-500px] z-50 left-0 -rotate-45 -translate-x-1/2 opacity-15 text-blue-400"
    />
    <AppBlur
      class="max-lg:hidden absolute top-0 left-full -translate-x-1/2 rotate-45 opacity-15 scale-50 text-blue-500"
    />

    <div id="hero-section" class="max-w-4xl mx-auto w-full text-center">
      <h1 id="hero-title" class="text-2xl lg:text-6xl font-semibold gsap-text">
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
