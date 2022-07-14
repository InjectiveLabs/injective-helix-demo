<template>
  <div>
    <div
      v-if="baseTradingBalance"
      class="flex justify-between items-center text-xs mb-2"
    >
      <span>
        {{ $t('trade.available_asset', { asset: market.baseToken.symbol }) }}
      </span>
      <span class="font-mono">{{ baseTradingAvailableBalanceToFormat }}</span>
    </div>

    <div class="flex justify-between items-center text-xs">
      <span>
        {{ $t('trade.available_asset', { asset: market.quoteToken.symbol }) }}
      </span>
      <span class="font-mono">{{ quoteTradingAvailableBalanceToFormat }}</span>
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
} from '@injectivelabs/sdk-ui-ts'

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
      default: undefined,
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
