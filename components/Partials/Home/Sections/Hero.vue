<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { getBridgeRedirectionUrl } from '@/app/utils/network'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { TradeSubPage } from '@/types'

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
</script>

<template>
  <div class="text-center mb-20 mt-10 md:mt-14">
    <div class="flex flex-col items-center">
      <div class="flex items-center space-x-4">
        <AssetLogo class="h-12 w-12" />
        <h1 class="font-light text-4xl">{{ $t('common.helix') }}</h1>
      </div>

      <div class="max-w-3xl space-y-4 my-4`">
        <h1
          class="text-2xl lg:text-6xl font-semibold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent py-2"
        >
          {{ $t('home.title') }}
        </h1>

        <p class="text-sm lg:text-xl text-gray-200 font-light">
          {{ $t('home.subtitle') }}
        </p>

        <div
          class="flex max-xs:flex-col max-xs:space-y-2 justify-center xs:space-x-2 py-4"
        >
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

    <div class="relative">
      <div
        class="absolute bottom-0 -left-[250px] blur-[10rem] bg-blue-300/20 w-[200px] h-[200px] md:w-[500px] md:h-[500px] rounded-full"
      ></div>
      <div class="shadow-[0px_0px_20px_20px_#1D1E24] my-16 mx-auto">
        <img
          src="/images/home/hero.wep"
          class="rounded-md border ring-[1px] relative object-cover"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 w-full gap-4 my-4">
      <div class="">
        <h2>{{ $t('home.tradingVolume') }}</h2>
        <p class="text-2xl font-semibold">
          ${{ totalVolume.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS) }}
        </p>
      </div>

      <div class="">
        <h2>{{ $t('home.markets') }}</h2>
        <p class="text-2xl font-semibold">{{ totalMarkets }}</p>
      </div>

      <div class="">
        <h2>{{ $t('home.totalVolume') }}</h2>
        <p class="text-2xl font-semibold">32B</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glow-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  box-shadow: 0 0 30px 10px rgba(0, 122, 255, 0.75); /* Adjusted glow effect */
  pointer-events: none;
}
</style>
