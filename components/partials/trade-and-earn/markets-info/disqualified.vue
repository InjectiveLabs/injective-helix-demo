<template>
  <v-item>
    <template slot="value">
      <span class="font-mono text-lg">
        {{ disqualifiedMarkets.join(', ') }}
      </span>
    </template>
    <template slot="title">
      <div class="flex items-center justify-center">
        {{ $t('disqualified_markets') }}
        <v-icon-info-tooltip
          class="ml-2"
          :tooltip="$t('disqualified_markets_tooltip')"
        />
      </div>
    </template>
  </v-item>
</template>

<script lang="ts">
import Vue from 'vue'
import VItem from '~/components/partials/common/stats/item.vue'
import { UiDerivativeMarket, UiSpotMarket } from '~/types'
import { TradingRewardsCampaign } from '~/types/exchange'

export default Vue.extend({
  components: {
    VItem
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    spotMarkets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    derivativeMarkets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    disqualifiedMarkets(): string[] {
      const { tradingRewardsCampaign, spotMarkets, derivativeMarkets } = this

      if (!tradingRewardsCampaign) {
        return []
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
        return []
      }

      if (
        !tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
      ) {
        return []
      }

      const marketIds =
        tradingRewardsCampaign.tradingRewardCampaignInfo
          .disqualifiedMarketIdsList

      const spotMarketsTickerBasedOnIds = spotMarkets
        .filter((spotMarket) => marketIds.includes(spotMarket.marketId))
        .map((m) => m.ticker)

      const derivativeMarketsTickerBasedOnIds = derivativeMarkets
        .filter((derivativeMarket) =>
          marketIds.includes(derivativeMarket.marketId)
        )
        .map((m) => m.ticker)

      return [
        ...derivativeMarketsTickerBasedOnIds,
        ...spotMarketsTickerBasedOnIds
      ]
    }
  }
})
</script>
