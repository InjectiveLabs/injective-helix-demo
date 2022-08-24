<template>
  <div
    :style="{ backgroundImage: `url('/svg/bg-dark.svg')` }"
    class="bg-cover py-14 bg-left-top"
  >
    <div class="w-full mx-auto max-w-xs sm:max-w-md md:max-w-full xl:w-4/5">
      <h1 class="text-4xl 4xl:text-5xl font-bold tracking-wide text-center">
        {{ $t('home.startTradingNote') }}
      </h1>

      <div class="text-center">
        <VButton
          lg
          primary
          class="w-60 mt-10 rounded"
          @click="handleGetStartedClick"
        >
          {{ $t('home.getStarted') }}
        </VButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import { Identify, identify } from '@amplitude/analytics-browser'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { AmplitudeEvents, DefaultMarket, TradeClickOrigin } from '~/types'
import { AMPLITUDE_VIP_TIER_LEVEL } from '~/app/utils/vendor'

export default Vue.extend({
  computed: {
    isUserWalletConnected() {
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
      if (this.isUserWalletConnected) {
        this.handleTradeClickedTrack()

        this.$router.push({
          name: 'perpetuals-perpetual',
          params: {
            perpetual: DefaultMarket.Perpetual
          }
        })
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
