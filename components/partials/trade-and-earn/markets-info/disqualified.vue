<template>
  <v-item>
    <template slot="value">
      <span v-if="disqualifiedMarkets.length > 0" class="font-mono text-lg">
        {{ disqualifiedMarkets.join(', ') }}
      </span>
      <span v-else class="text-xs font-normal">
        {{ $t('there_are_no_disqualified_markets_on_this_relayer') }}
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
import { UiDerivativeMarket } from '~/types'
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

    derivativeMarkets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    disqualifiedMarkets(): string[] {
      const { tradingRewardsCampaign, derivativeMarkets } = this

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

      const derivativeMarketsTickerBasedOnIds = derivativeMarkets
        .filter((derivativeMarket) =>
          marketIds.includes(derivativeMarket.marketId)
        )
        .map((m) => m.ticker)

      return [...derivativeMarketsTickerBasedOnIds]
    }
  }
})
</script>
