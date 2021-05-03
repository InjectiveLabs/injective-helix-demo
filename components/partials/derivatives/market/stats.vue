<template>
  <div v-if="market" class="flex flex-wrap justify-start -mx-2">
    <v-market-info :title="$t('last_traded_price')">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-price
          v-bind="{
            value: lastPrice.toBase(market.quoteToken.decimals),
            decimals: market.priceDecimals
          }"
        />
      </v-ui-text>
    </v-market-info>
    <v-market-info :title="$t('market_change_24h')" class="">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-percent
          v-bind="{
            appendPlusSign: true,
            precision: 2,
            value: market.change.toString(),
            class: market.change > 0 ? 'text-primary-500' : 'text-accent-500'
          }"
        />
      </v-ui-text>
    </v-market-info>
    <v-market-info
      :title="$t('volume_asset', { asset: market.quoteToken.symbol })"
    >
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-price
          v-bind="{
            dontGroupValues: true,
            value: volume
          }"
        />
      </v-ui-text>
    </v-market-info>
    <v-market-info :title="$t('high')">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-price
          v-if="high.gt(0)"
          v-bind="{
            value: high
          }"
        />
        <span v-else class="text-gray-500">&mdash;</span>
      </v-ui-text>
    </v-market-info>
    <v-market-info :title="$t('low')">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-price
          v-if="high.gt(0)"
          v-bind="{
            value: low
          }"
        />
        <span v-else class="text-gray-500">&mdash;</span>
      </v-ui-text>
    </v-market-info>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_WEI } from '~/app/utils/constants'
import MarketInfo from '~/components/elements/market-info.vue'
import { Change, UiDerivativeMarket, UiDerivativeTrade } from '~/types'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.trades
    },

    lastPrice(): BigNumberInWei {
      const { trades, market } = this
      const [lastTrade] = trades || []

      if (!lastTrade || !market) {
        return ZERO_IN_WEI
      }

      if (!lastTrade.executionPrice) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(lastTrade.executionPrice)
    },

    high(): BigNumberInWei {
      const { market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(market.high)
    },

    low(): BigNumberInWei {
      const { market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(market.low)
    },

    price(): BigNumberInWei {
      const { market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(market.price)
    },

    volume(): BigNumberInWei {
      const { market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(market.volume)
    },

    indexPriceIncreased(): boolean {
      const { market } = this

      if (!market) {
        return true
      }

      return [Change.Increase, Change.NoChange].includes(Change.Increase) // TODO
    }
  }
})
</script>
