<template>
  <div
    class="p-2 xl:p-4 bg-gray-900 rounded-sm shadow-sm flex flex-col flex-wrap"
  >
    <div>
      <v-text-info
        v-if="!baseTokenBalance.isNaN()"
        :title="market.baseToken.symbol"
      >
        <span class="font-mono">{{ baseTokenBalanceToFormat }}</span>
      </v-text-info>
      <v-text-info class="mt-2" :title="market.quoteToken.symbol">
        <span class="font-mono">
          {{ quoteTokenBalanceToFormat }}
        </span>
      </v-text-info>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import {
  BankBalances,
  MarketType,
  UiDerivativeMarket,
  UiSpotMarket
} from '~/types'

export default Vue.extend({
  props: {
    market: {
      required: true,
      type: Object as PropType<UiDerivativeMarket | UiSpotMarket>
    }
  },

  computed: {
    balances(): BankBalances {
      return this.$accessor.bank.balances
    },

    baseTokenBalance(): BigNumberInBase {
      const { balances, market } = this

      if (market.type === MarketType.Derivative) {
        return new BigNumberInBase('')
      }

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!balances[(market as UiSpotMarket).baseDenom]) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(
        balances[(market as UiSpotMarket).baseDenom] || 0
      ).toBase(market.baseToken.decimals)
    },

    baseTokenBalanceToFormat(): string {
      const { baseTokenBalance, market } = this

      if (baseTokenBalance.isNaN()) {
        return ''
      }

      return baseTokenBalance.toFormat(
        market.quantityDecimals,
        BigNumberInBase.ROUND_DOWN
      )
    },

    quoteTokenBalanceToFormat(): string {
      const { quoteTokenBalance, market } = this

      return quoteTokenBalance.toFormat(
        market.quantityDecimals,
        BigNumberInBase.ROUND_DOWN
      )
    },

    quoteTokenBalance(): BigNumberInBase {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!balances[market.quoteDenom]) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balances[market.quoteDenom] || 0).toBase(
        market.quoteToken.decimals
      )
    }
  }
})
</script>
