<template>
  <div v-if="market" class="flex flex-wrap justify-start -mx-2">
    <v-market-info :title="$t('last_traded_price')">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-price
          v-bind="{
            value: lastPrice,
            class: {
              'text-primary-500': lastPriceChange === Change.Increase,
              'text-accent-500': lastPriceChange === Change.Decrease
            },
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
            decimals: 0,
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
    <v-market-info
      v-if="market.isPerpetual"
      :title="$t('funding_rate')"
      class=""
    >
      <v-ui-icon
        slot="icon"
        :icon="Icon.Info"
        class="text-gray-600 hover:text-gray-300"
        :tooltip="$t('funding_rate_tooltip')"
        2xs
      />
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-percent
          v-bind="{
            appendPlusSign: true,
            precision: 2,
            value: fundingRate.toFixed(2)
          }"
        />
      </v-ui-text>
    </v-market-info>
    <client-only v-if="market.isPerpetual">
      <v-market-next-funding-countdown />
    </client-only>
    <client-only v-if="!market.isPerpetual">
      <v-market-expiry-countdown />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import NextFunding from './next-funding.vue'
import MarketExpiry from './market-expiry.vue'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import MarketInfo from '~/components/elements/market-info.vue'
import {
  DerivativeOrderType,
  UiDerivativeMarket,
  UiDerivativeTrade,
  Change,
  Icon
} from '~/types'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo,
    'v-market-expiry-countdown': MarketExpiry,
    'v-market-next-funding-countdown': NextFunding
  },

  data() {
    return {
      DerivativeOrderType,
      Change,
      Icon
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.trades
    },

    lastPrice(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!market.price) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.price)
    },

    lastPriceChange(): Change {
      const { market } = this

      if (!market) {
        return Change.NoChange
      }

      if (!market.lastPrice) {
        return Change.NoChange
      }

      return new BigNumberInBase(market.price).gte(market.lastPrice)
        ? Change.Increase
        : Change.Decrease
    },

    high(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.high)
    },

    low(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.low)
    },

    price(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.price)
    },

    volume(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(market.volume).dp(0).toFixed()
      )
    },

    fundingRate(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!market.perpetualMarketFunding || !market.isPerpetual) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        market.perpetualMarketFunding.cumulativeFunding
      ).multipliedBy(100)
    }
  }
})
</script>
