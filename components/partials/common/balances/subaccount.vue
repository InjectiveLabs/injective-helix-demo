<template>
  <div class="p-2 bg-gray-900 rounded shadow-sm flex flex-col flex-wrap">
    <div class="">
      <v-text-info v-if="baseTradingBalance" :title="market.baseToken.symbol">
        <div class="flex items-center">
          <span class="font-mono">
            {{ baseTradingAvailableBalanceToFormat }}
          </span>
        </div>
      </v-text-info>
      <v-text-info class="mt-2" :title="market.quoteToken.symbol">
        <div class="flex items-center">
          <span class="font-mono">
            {{ quoteTradingAvailableBalanceToFormat }}
          </span>
        </div>
      </v-text-info>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import {
  ZERO_IN_BASE,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  UiSubaccount,
  UiSubaccountBalanceWithToken
} from '@injectivelabs/ui-common'

export default Vue.extend({
  props: {
    market: {
      required: true,
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >
    },

    baseTradingBalance: {
      required: false,
      default: undefined,
      type: Object as PropType<UiSubaccountBalanceWithToken>
    },

    quoteTradingBalance: {
      required: true,
      type: Object as PropType<UiSubaccountBalanceWithToken>
    }
  },

  computed: {
    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    baseTradingAvailableBalanceToFormat(): string {
      const { baseTradingBalance, market } = this

      if (!baseTradingBalance) {
        return ZERO_IN_BASE.toFormat(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return new BigNumberInWei(baseTradingBalance.availableBalance)
        .toBase(market.baseToken.decimals)
        .toFormat(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    },

    quoteTradingAvailableBalanceToFormat(): string {
      const { quoteTradingBalance, market } = this

      if (!quoteTradingBalance) {
        return ZERO_IN_BASE.toFormat(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return new BigNumberInWei(quoteTradingBalance.availableBalance)
        .toBase(market.quoteToken.decimals)
        .toFormat(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    }
  }
})
</script>
