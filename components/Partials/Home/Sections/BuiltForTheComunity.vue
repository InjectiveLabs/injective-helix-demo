<script setup lang="ts">
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const TOTAL_VOLUME_IN_USD = '42.5 Billion'

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
        <img
          :style="{
            aspectRatio: 1264 / 828
          }"
          src="/images/helix-platform-long.webp"
          class="max-w-[500px] 2xl:max-w-[800px] mx-auto w-full shadow-[0_-1px_16px_rgba(14,226,155,0.70)] rounded-xl border border-white/50"
          s
          alt=""
        />
      </div>
    </div>

    <div
      class="flex justify-center font-semibold max-lg:mt-6 gap-[120px] max-sm:gap-6 max-sm:items-center max-sm:flex-col mt-8"
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

      <div class="flex flex-col items-center justify-center">
        <p class="text-coolGray-400">
          {{ $t('home.totalMarkets') }}
        </p>
        <p class="text-2xl">{{ totalMarkets }}</p>
      </div>
    </div>
  </div>
</template>
