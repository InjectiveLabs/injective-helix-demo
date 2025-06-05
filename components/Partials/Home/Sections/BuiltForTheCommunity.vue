<script setup lang="ts">
import { TradeSubPage } from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const TOTAL_VOLUME_IN_USD = '50+ Billion'

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
        end: () => 'bottom 10%',
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
  <div class="relative max-lg:pt-24 lg:pb-48">
    <img
      src="/svg/blurs/blur-1.svg"
      class="absolute top-52 -left-52 blur-xl pointer-events-none"
    />
    <img
      src="/svg/blurs/blur-1.svg"
      class="absolute -top-20 left-1/2 blur-xl pointer-events-none"
    />

    <div
      id="built-for-the-community-text"
      class="relative z-[2] lg:opacity-0 lg:blur-3xl"
    >
      <h1 class="text-2xl lg:text-5xl font-semibold text-center">
        {{ $t('home.builtForTheCommunity') }}
      </h1>
      <p class="text-lg text-center mt-4">
        {{ $t('home.builtForTheCommunityDescription') }}
      </p>
    </div>

    <div class="relative z-[3] pt-8 pb-4">
      <div id="built-for-the-community-image" class="rounded-xl">
        <img
          :style="{
            aspectRatio: 1264 / 828
          }"
          src="/images/helix-platform-long.webp"
          class="max-w-[500px] 2xl:max-w-[800px] bg-black mx-auto w-full shadow-[0_-1px_16px_rgba(14,226,155,0.70)] rounded-xl border border-white/50"
          alt=""
        />
      </div>
    </div>

    <div
      class="relative z-[2] flex justify-center flex-wrap gap-6 mt-6 lg:mt-8 lg:gap-16"
    >
      <img
        src="/svg/blurs/blur-1.svg"
        class="absolute -top-52 -left-0 rotate-180 blur-xl pointer-events-none"
      />

      <NuxtLink :to="{ name: TradeSubPage.Spot, params: { slug: 'inj-usdt' } }">
        <AppButton class="w-52 h-12 font-semibold">
          {{ $t('home.startTrading') }}
        </AppButton>
      </NuxtLink>

      <NuxtLink to="https://docs.helixapp.com/" target="_blank">
        <AppButton class="w-52 h-12 font-semibold" variant="primary-outline">
          {{ $t('home.helixDocs') }}
        </AppButton>
      </NuxtLink>
    </div>

    <div
      class="relative z-[2] flex justify-center font-semibold gap-[120px] max-sm:gap-6 max-sm:items-center max-sm:flex-col mt-12 lg:mt-16"
    >
      <div
        class="lg:text-center lg:min-w-44 flex flex-col items-center justify-center"
      >
        <p class="text-coolGray-400">{{ $t('home.gasFees') }}</p>
        <div class="text-2xl">0</div>
      </div>

      <div class="lg:min-w-44 flex flex-col items-center justify-center">
        <p class="text-coolGray-400">{{ $t('home.totalVolume') }}</p>
        <div class="text-2xl flex">
          <span>$</span>
          <div>{{ TOTAL_VOLUME_IN_USD }}</div>
        </div>
      </div>

      <div class="lg:min-w-44 flex flex-col items-center justify-center">
        <p class="text-coolGray-400">
          {{ $t('home.totalMarkets') }}
        </p>
        <p class="text-2xl">{{ totalMarkets }}</p>
      </div>
    </div>
  </div>
</template>
