<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { getDefaultSpotMarketRouteParams } from '@/app/utils/market'
import { TradeClickOrigin, Modal, DefaultMarket } from '@/types'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
const router = useRouter()
const modalStore = useModalStore()
const walletStore = useWalletStore()

function onGetStartedClick() {
  tradeClickedTrack()

  if (walletStore.isUserWalletConnected) {
    router.push(getDefaultSpotMarketRouteParams())
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function tradeClickedTrack() {
  mixpanelAnalytics.trackNavigateToTradePage({
    market: DefaultMarket.Spot,
    marketType: MarketType.Spot,
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
          {{ $t('home.accessTheFuture') }}
        </h1>

        <div class="text-center space-x-2">
          <AppButton
            is-lg
            class="mt-2 md:mt-10 bg-blue-500 text-blue-900 hover:bg-blue-600 hover:bg-opacity-100"
            @click="onGetStartedClick"
          >
            {{ $t('home.tradeNow') }}
          </AppButton>
          <NuxtLink to="/institutional">
            <AppButton
              is-lg
              class="mt-2 md:mt-10 text-white border border-white hover:bg-opacity-100"
            >
              {{ $t('home.helixInstitutional') }}
            </AppButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <PartialsHomeNewsletter />
  </div>
</template>
