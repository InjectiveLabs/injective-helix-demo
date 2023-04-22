<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { amplitudeTradeTracker } from '@/app/providers/amplitude'
import { getDefaultPerpetualMarketRouteParams } from '@/app/utils/market'
import { DefaultMarket, TradeClickOrigin, Modal } from '@/types'

const router = useRouter()
const modalStore = useModalStore()
const walletStore = useWalletStore()

function handleGetStartedClick() {
  handleTradeClickedTrack()

  if (walletStore.isUserWalletConnected) {
    router.push(getDefaultPerpetualMarketRouteParams())
  } else {
    modalStore.openModal({ type: Modal.Connect })
  }
}

function handleTradeClickedTrack() {
  amplitudeTradeTracker.navigateToTradePageTrackEvent({
    market: DefaultMarket.Perpetual,
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
          {{ $t('home.fast') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <BaseIcon
          name="bounding-box-circles"
          class="text-gray-900 w-6 h-6 mr-3"
        />
        <span class="text-gray-900 text-lg">
          {{ $t('home.interoperable') }}
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
          {{ $t('home.secure') }}
        </span>
      </div>
    </div>
    <AppButton
      lg
      class="bg-gray-750 text-white mt-8 font-semibold"
      @click="handleGetStartedClick"
    >
      {{ $t('home.startTradingNow') }}
    </AppButton>
  </div>
</template>
