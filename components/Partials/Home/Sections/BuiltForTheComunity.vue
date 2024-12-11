<script setup lang="ts">
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const TOTAL_VOLUME_IN_USD = '42.5 Billion'

const totalMarkets = computed(
  () =>
    [...spotStore.activeMarketIds, ...derivativeStore.activeMarketIds].length
)
</script>

<template>
  <div
    class="relative pb-32 max-lg:pb-28 max-xs:pb-24 gsap-section lg:h-screen grid place-items-center"
  >
    <div>
      <div id="built-for-the-community-text">
        <h1 class="text-2xl lg:text-5xl font-semibold text-center">
          {{ $t('home.builtForTheCommunity') }}
        </h1>
        <p class="text-lg text-center">
          {{ $t('home.builtForTheCommunityDescription') }}
        </p>
      </div>

      <div class="pt-8 pb-4 max-lg:p-0">
        <div id="built-for-the-community-image" class="rounded-xl">
          <img
            :style="{
              aspectRatio: 1264 / 828
            }"
            src="/images/helix-platform.png"
            class="max-w-[800px] mx-auto"
          />
        </div>
      </div>

      <div
        class="flex justify-center font-semibold -mt-4 max-lg:mt-6 gap-[120px] max-sm:gap-6 max-sm:items-center max-sm:flex-col"
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
  </div>
</template>
