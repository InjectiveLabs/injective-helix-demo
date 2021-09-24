<template>
  <div
    class="p-2 xl:p-4 bg-gray-900 rounded-xl shadow-sm flex flex-col flex-wrap"
  >
    <div>
      <v-text-info v-if="baseBalance" :title="market.baseToken.symbol">
        <div class="flex items-center">
          <span class="font-mono">
            {{ baseAvailableBalanceToFormat }}/{{ baseTotalBalanceToFormat }}
          </span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('available_total_subaccount_balance Tooltip')"
          />
        </div>
      </v-text-info>
      <v-text-info class="mt-2" :title="market.quoteToken.symbol">
        <div class="flex items-center">
          <span class="font-mono">
            {{ quoteAvailableBalanceToFormat }}/{{ quoteTotalBalanceToFormat }}
          </span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('available_total_subaccount_balance Tooltip')"
          />
        </div>
      </v-text-info>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import {
  MarketType,
  UiDerivativeMarket,
  UiSpotMarket,
  UiSubaccount,
  UiSubaccountBalanceWithToken
} from '~/types'

export default Vue.extend({
  props: {
    market: {
      required: true,
      type: Object as PropType<UiDerivativeMarket | UiSpotMarket>
    }
  },

  computed: {
    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    quoteBalance(): UiSubaccountBalanceWithToken | undefined {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return undefined
      }

      const quoteBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.quoteDenom.toLowerCase()
      )

      return {
        totalBalance: quoteBalance ? quoteBalance.totalBalance : '0',
        availableBalance: quoteBalance ? quoteBalance.availableBalance : '0'
      }
    },

    baseBalance(): UiSubaccountBalanceWithToken | undefined {
      const { subaccount, market } = this

      if (!subaccount || !market || market.type === MarketType.Derivative) {
        return undefined
      }

      const baseBalance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() ===
          (market as UiSpotMarket).baseDenom.toLowerCase()
      )

      return {
        totalBalance: baseBalance ? baseBalance.totalBalance : '0',
        availableBalance: baseBalance ? baseBalance.availableBalance : '0'
      }
    },

    baseAvailableBalanceToFormat(): string {
      const { baseBalance, market } = this

      if (!baseBalance) {
        return ZERO_IN_BASE.toFormat(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return new BigNumberInWei(baseBalance.availableBalance)
        .toBase(market.baseToken.decimals)
        .toFormat(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    },

    baseTotalBalanceToFormat(): string {
      const { baseBalance, market } = this

      if (!baseBalance) {
        return ZERO_IN_BASE.toFormat(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return new BigNumberInWei(baseBalance.totalBalance)
        .toBase(market.baseToken.decimals)
        .toFormat(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    },

    quoteAvailableBalanceToFormat(): string {
      const { quoteBalance, market } = this

      if (!quoteBalance) {
        return ZERO_IN_BASE.toFormat(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return new BigNumberInWei(quoteBalance.availableBalance)
        .toBase(market.quoteToken.decimals)
        .toFormat(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    },

    quoteTotalBalanceToFormat(): string {
      const { quoteBalance, market } = this

      if (!quoteBalance) {
        return ZERO_IN_BASE.toFormat(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return new BigNumberInWei(quoteBalance.totalBalance)
        .toBase(market.quoteToken.decimals)
        .toFormat(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    }
  }
})
</script>
