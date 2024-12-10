<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const totalVolume = computed(() =>
  [...spotStore.marketsSummary, ...derivativeStore.marketsSummary].reduce(
    (sum, market) => {
      return sum.plus(market.volume || 0)
    },
    ZERO_IN_BASE
  )
)

const totalMarkets = computed(
  () =>
    [...spotStore.activeMarketIds, ...derivativeStore.activeMarketIds].length
)

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    gsap.to('#built-for-the-community-text', {
      scrollTrigger: {
        trigger: '#built-for-the-community-text',
        start: () => 'top 40%',
        end: () => 'bottom 0%',
        scrub: 1,
        pin: true
      },
      opacity: 1,
      filter: 'blur(0px)'
    })

    gsap.to('#built-for-the-community-image', {
      scrollTrigger: {
        trigger: '#built-for-the-community-image',
        start: () => 'top 20%',
        end: () => 'bottom 40%',
        scrub: 2,
        pin: true
      },
      scale: 0.9
    })
  })
})
</script>

<template>
  <div class="relative pb-32 snap-start">
    <div id="built-for-the-community-text" class="opacity-0 blur-3xl">
      <h1 class="text-2xl lg:text-5xl font-semibold text-center">
        {{ $t('home.builtForTheCommunity') }}
      </h1>
      <p class="text-lg text-center">
        {{ $t('home.builtForTheCommunityDescription') }}
      </p>
    </div>

    <div class="pt-8 pb-4">
      <div id="built-for-the-community-image" class="rounded-xl">
        <img src="/images/helix-platform.png" class="w-full h-full" alt="" />
      </div>
    </div>

    <div class="flex justify-center space-x-20 font-semibold mt-10">
      <div>
        <p class="text-coolGray-400">{{ $t('home.totalVolume') }}</p>
        <div class="text-2xl">
          <AppAmount
            :amount="totalVolume.toFixed()"
            :min-display-decimals="0"
          />
        </div>
      </div>
      <div>
        <p class="text-coolGray-400">{{ $t('home.totalMarkets') }}</p>
        <p class="text-2xl">{{ totalMarkets }}</p>
      </div>
    </div>
  </div>
</template>
