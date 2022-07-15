<template>
  <!-- eslint-disable vue/no-parsing-error -->
  <tr v-if="market" :data-cy="'funding-payments-table-row-' + market.ticker">
    <td class="h-8 font-mono">
      <span class="text-gray-400 text-xs">{{ time }}</span>
    </td>

    <td class="h-8 text-left cursor-pointer">
      <nuxt-link class="flex items-center justify-start" :to="marketRoute">
        <div v-if="baseTokenLogo" class="w-6 h-6">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 font-semibold"
            data-cy="funding-payments-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </nuxt-link>
    </td>

    <td class="h-8 text-right font-mono">
      <VNumber
        v-if="total.abs().gt(UI_MINIMAL_AMOUNT)"
        data-cy="funding-payments-total-table-data"
        :class="{
          'text-aqua-500': total.gte(0),
          'text-red-500': total.lt(0)
        }"
        :decimals="UI_DEFAULT_MAX_DISPLAY_DECIMALS"
        :number="total"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </VNumber>
      <span
        v-else
        :class="{
          'text-aqua-500': total.gte(0),
          'text-red-500': total.lt(0)
        }"
      >
        {{ `< ${UI_MINIMAL_AMOUNT.toFormat(6)}` }}
      </span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { format } from 'date-fns'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'
import {
  getTokenLogoWithVendorPathPrefix,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getMarketRoute } from '~/app/utils/market'
import { MarketRoute } from '~/types'

export default Vue.extend({
  props: {
    fundingPayment: {
      required: true,
      type: Object as PropType<FundingPayment>
    }
  },

  data() {
    return {
      UI_MINIMAL_AMOUNT: new BigNumber(1).shiftedBy(-6),
      UI_DEFAULT_MIN_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      UI_DEFAULT_MAX_DISPLAY_DECIMALS,
      TradeDirection,
      TradeExecutionType
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    market(): UiDerivativeMarketWithToken | undefined {
      const { markets, fundingPayment } = this

      const result = markets.find((m) => m.marketId === fundingPayment.marketId)

      if (!result) {
        // TODO: No valid market found in exchangeDerivativesApi.fetchMarkets() response.
        // Find a way to get correct market anyway.
      }

      return result
    },

    total(): BigNumberInBase {
      const { market, fundingPayment } = this

      if (!fundingPayment.amount) {
        return ZERO_IN_BASE
      }

      const decimals = market
        ? market.quoteToken.decimals
        : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS

      return new BigNumberInWei(fundingPayment.amount).toBase(decimals)
    },

    time(): string {
      const { fundingPayment } = this

      if (!fundingPayment.timestamp) {
        return ''
      }

      return format(fundingPayment.timestamp, 'dd MMM HH:mm:ss')
    },

    marketRoute(): MarketRoute {
      const { market } = this

      if (!market) {
        return { name: 'markets' }
      }

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'markets' }
    },

    baseTokenLogo(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (!market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    }
  }
})
</script>
