<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import {
  getDefaultFuturesMarket,
  getDefaultPerpetualMarketRouteParams
} from '@/app/utils/market'
import { TradeClickOrigin, Modal } from '@/types'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
const router = useRouter()
const modalStore = useModalStore()
const walletStore = useWalletStore()

function onGetStartedClick() {
  tradeClickedTrack()

  if (walletStore.isUserWalletConnected) {
    router.push(getDefaultPerpetualMarketRouteParams())
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function tradeClickedTrack() {
  mixpanelAnalytics.trackNavigateToTradePage({
    market: getDefaultFuturesMarket(),
    marketType: MarketType.Perpetual,
    origin: TradeClickOrigin.Lander
  })
}
</script>

<template>
  <div class="flex flex-col sm:block">
    <div class="flex items-center justify-start mb-8">
      <AssetLogo class="w-auto h-6" alt="Helix" />
      <AssetLogoText class="block ml-2 h-6 text-gray-900" />
    </div>
    <h1
      class="text-gray-900 font-bold text-[36px] leading-[58px] sm:text-5xl sm:leading-[60px] 3xl:leading-[72px] 3xl:text-[60px] 4xl:leading-[77px] 4xl:text-[64px] mb-8"
    >
      {{ $t('home.title') }}
    </h1>
    <p class="text-gray-900 mt-4 text-base 3xl:text-xl mb-8">
      {{ $t('home.subtitle') }}
    </p>
    <div class="grid grid-cols-12 gap-4 text-base 3xl:text-xl">
      <div class="col-span-6 flex items-center justify-start">
        <BaseIcon name="lightning-fill" class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.infiniteMarkets') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <BaseIcon
          name="bounding-box-circles"
          class="text-gray-900 w-6 h-6 mr-3"
        />
        <span class="text-gray-900 text-lg">
          {{ $t('home.mevResistant') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <BaseIcon name="gas" class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.gasFree') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <BaseIcon name="shield-lock-fill" class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.InstitutionalGateways') }}
        </span>
      </div>
    </div>
    <div class="space-x-2 pt-8 flex">
      <button
        is-lg
        class="bg-gray-750 text-white font-semibold rounded-md px-4 py-2 hover:bg-gray-600"
        @click="onGetStartedClick"
      >
        {{ $t('home.getStartedHome') }}
      </button>

      <NuxtLink
        is-lg
        class="hover:bg-gray-750/10 border-gray-750 border text-black px-4 py-2 rounded-md font-semibold"
        is-primary
        to="/institutional"
      >
        {{ $t('home.helixInstitutional') }}
      </NuxtLink>
    </div>
  </div>
</template>
