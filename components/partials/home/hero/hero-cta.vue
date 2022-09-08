<template>
  <div class="flex flex-col sm:block">
    <div class="flex items-center justify-start mb-8">
      <Logo class="w-auto h-6" alt="Helix" />
      <LogoText class="block ml-2 h-6 text-gray-900" />
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
        <IconLightningFill class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.fast') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <IconBoundingBoxCircles class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.interoperable') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <IconGas class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.gasFree') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <IconShieldLockFill class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.secure') }}
        </span>
      </div>
    </div>
    <VButton
      lg
      gray
      class="min-w-4xs mt-8 rounded"
      @click="handleGetStartedClick"
    >
      {{ $t('home.startTradingNow') }}
    </VButton>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import { Identify, identify } from '@amplitude/analytics-browser'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import LogoText from '~/components/elements/logo-text.vue'
import Logo from '~/components/elements/logo.vue'
import { AmplitudeEvents, DefaultMarket, TradeClickOrigin } from '~/types'
import { AMPLITUDE_VIP_TIER_LEVEL } from '~/app/utils/vendor'
import { getDefaultPerpetualMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    Logo,
    LogoText
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
    }
  },

  methods: {
    handleGetStartedClick() {
      this.handleTradeClickedTrack()

      if (this.isUserWalletConnected) {
        this.$router.push(getDefaultPerpetualMarketRoute())
      } else {
        this.$root.$emit('wallet-clicked')
      }
    },

    handleTradeClickedTrack() {
      const identifyObj = new Identify()
      identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, this.tierLevel)
      identify(identifyObj)

      this.$amplitude.track(AmplitudeEvents.TradeClicked, {
        market: DefaultMarket.Perpetual,
        marketType: MarketType.Perpetual,
        origin: TradeClickOrigin.Lander
      })
    }
  }
})
</script>
