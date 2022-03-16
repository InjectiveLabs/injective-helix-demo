<template>
  <!-- eslint-disable vue/no-parsing-error -->
  <tr v-if="market">
    <td class="h-8 font-mono">
      <span class="text-gray-400 text-xs">{{ time }}</span>
    </td>

    <td class="h-8 text-left cursor-pointer" @click="handleClickOnMarket">
      <div class="flex items-center justify-start">
        <div v-if="market.baseToken.logo" class="w-6 h-6">
          <img
            :src="market.baseToken.logo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span class="text-gray-200 font-semibold">
            {{ market.ticker }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-8 text-right font-mono">
      <v-number
        v-if="total.abs().gt(UI_MINIMAL_AMOUNT)"
        :class="{
          'text-aqua-500': total.gte(0),
          'text-red-500': total.lt(0)
        }"
        :decimals="UI_DEFAULT_MAX_DISPLAY_DECIMALS"
        :prefix="total.lt(0) ? '-' : ''"
        :number="total"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </v-number>
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
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import { FundingPayment } from '@injectivelabs/derivatives-consumer'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

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

      return markets.find((m) => m.marketId === fundingPayment.marketId)
    },

    total(): BigNumberInBase {
      const { market, fundingPayment } = this

      if (!market || !fundingPayment.amount) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(fundingPayment.amount).toBase(
        market.quoteToken.decimals
      )
    },

    time(): string {
      const { market, fundingPayment } = this

      if (!market || !fundingPayment.timestamp) {
        return ''
      }

      return format(fundingPayment.timestamp, 'dd MMM HH:mm:ss')
    }
  },

  methods: {
    handleClickOnMarket() {
      const { market } = this

      if (!market) {
        return
      }

      return this.$router.push({
        name: 'derivatives-derivative',
        params: {
          marketId: market.marketId,
          derivative: market.slug
        }
      })
    }
  }
})
</script>
