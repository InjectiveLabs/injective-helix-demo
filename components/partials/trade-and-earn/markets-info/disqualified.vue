<template>
  <v-item>
    <template slot="value">
      <span v-if="disqualifiedMarkets.length > 0" class="font-mono text-lg">
        {{ disqualifiedMarkets.join(', ') }}
      </span>
      <span v-else class="text-xs font-normal">
        {{ $t('trade.there_are_no_disqualified_markets_on_this_relayer') }}
      </span>
    </template>
    <template slot="title">
      <div class="flex items-center justify-center">
        {{ $t('trade.disqualified_markets') }}
        <IconInfoTooltip
          class="ml-2"
          :tooltip="$t('trade.disqualified_markets_tooltip')"
        />
      </div>
    </template>
  </v-item>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import VItem from '~/components/partials/common/stats/item.vue'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'

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

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    derivativeMarkets(): UiDerivativeMarketWithToken[] {
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
