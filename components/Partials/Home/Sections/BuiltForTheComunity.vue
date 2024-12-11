<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { usdtToken } from '@shared/data/token'
import { ZERO_IN_BASE } from '@shared/utils/constant'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()

const { valueToFixed: totalVolumeInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    [...spotStore.marketsSummary, ...derivativeStore.marketsSummary].reduce(
      (sum, market) => {
        if (new BigNumberInBase(market.volume).isNaN()) {
          return sum
        }

        const volumeInUsd = new BigNumberInBase(market.volume).times(
          tokenStore.tokenUsdPrice(usdtToken)
        )

        return sum.plus(volumeInUsd)
      },
      ZERO_IN_BASE
    )
  ),
  { decimalPlaces: 0 }
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
  <div class="relative pb-32 max-lg:pb-28 max-xs:pb-24 snap-start">
    <div id="built-for-the-community-text" class="opacity-0 blur-3xl">
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
          class="w-full"
        />
      </div>
    </div>

    <div
      class="flex justify-center font-semibold mt-10 max-lg:mt-6 gap-[120px] max-sm:gap-6 max-sm:items-center max-sm:flex-col"
    >
      <div class="lg:min-w-44 max-xs:flex max-xs:flex-col max-xs:items-center">
        <p class="text-coolGray-400">{{ $t('home.dailyVolume') }}</p>
        <div class="text-2xl">
          <span>$</span>
          <AppUsdAmount
            v-bind="{ amount: totalVolumeInUsdToFixed, isShowNoDecimals: true }"
          />
        </div>
      </div>

      <div
        class="lg:text-center lg:min-w-44 max-xs:flex max-xs:flex-col max-xs:items-center"
      >
        <p class="text-coolGray-400">{{ $t('home.gasFees') }}</p>
        <div class="text-2xl">0</div>
      </div>

      <div class="max-xs:flex max-xs:flex-col max-xs:items-center">
        <p class="text-coolGray-400 lg:min-w-44">
          {{ $t('home.totalMarkets') }}
        </p>
        <p class="text-2xl">{{ totalMarkets }}</p>
      </div>
    </div>
  </div>
</template>
