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
  <div>
    <div
      :style="{ backgroundImage: `url('/svg/cta-area.svg')` }"
      class="bg-cover py-14 bg-left-top h-[189px] md:h-[790px] flex items-center"
    >
      <div
        class="w-full mx-auto max-w-xs sm:max-w-md md:max-w-full xl:w-4/5 flex flex-col md:block items-center"
      >
        <h1
          class="text-2xl md:text-4xl 4xl:text-5xl font-bold tracking-wide text-center"
        >
          {{ $t('home.startTradingNote') }}
        </h1>

        <div class="text-center">
          <AppButton
            lg
            class="mt-2 md:mt-10 bg-blue-500 text-blue-900 hover:bg-blue-600 hover:bg-opacity-100"
            @click="handleGetStartedClick"
          >
            {{ $t('home.tradeNow') }}
          </AppButton>
        </div>
      </div>
    </div>

    <PartialsHomeNewsletter />
  </div>
</template>
