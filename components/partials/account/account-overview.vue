<template>
  <div
    class="flex justify-between md:items-center mb-8 gap-4 flex-col md:flex-row"
  >
    <div class="flex items-center justify-start gap-2">
      <span class="text-white font-bold text-2xl md:text-3xl">
        &dollar; {{ abbreviatedTotalBalanceToString }} USD
      </span>

      <span class="text-gray-450 md:text-lg">
        &thickapprox; {{ totalBalanceInBtcToString }} BTC
      </span>

      <div @click="toggleHideBalances">
        <IconHide
          v-if="hideBalances"
          class="w-4 h-4 text-gray-450 hover:text-white cursor-pointer"
        />

        <IconShow
          v-else
          class="w-4 h-4 text-gray-450 hover:text-white cursor-pointer"
        />
      </div>
    </div>

    <div class="flex items-center justify-between md:justify-end gap-4">
      <button
        class="flex justify-center items-center px-4 h-10 rounded-lg bg-blue-300 border border-blue-300 w-full md:w-auto"
        @click="handleDepositClick"
      >
        <span class="text-white font-medium">
          {{ $t('account.deposit') }}
        </span>
      </button>

      <button
        class="flex justify-center items-center px-4 h-10 rounded-lg bg-transparent border border-blue-300 w-full md:w-auto"
        @click="handleWithdrawClick"
      >
        <span class="text-blue-300 font-medium">
          {{ $t('account.withdraw') }}
        </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getAbbreviatedVolume } from '~/app/utils/market'
import { AccountBalance } from '~/types'

export default Vue.extend({
  props: {
    balances: {
      type: Array as PropType<AccountBalance[]>,
      required: true
    },

    hideBalances: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    btcUsdPrice(): number {
      return this.$accessor.token.btcUsdPrice
    },

    totalBalance(): BigNumberInBase {
      const { balances } = this

      return (
        balances
          // TODO: Investigate proper solution for SOMM related markets.
          .filter((balance) => !balance.subaccountTotalBalance.isNaN())
          .reduce((total, balance) => {
            const combinedBalance = balance.bankBalance.plus(
              balance.subaccountTotalBalance
            )

            return total.plus(combinedBalance)
          }, ZERO_IN_BASE)
      )
    },

    totalBalanceInUsd(): BigNumberInBase {
      const { balances } = this

      const result = balances
        // TODO: Investigate proper solution for SOMM related markets.
        .filter((balance) => !balance.subaccountTotalBalance.isNaN())
        .reduce((total, balance) => {
          const combinedBalance = balance.bankBalance.plus(
            balance.subaccountTotalBalance
          )

          const combinedBalanceInUsd = combinedBalance.times(
            balance.token.usdPrice
          )

          return total.plus(combinedBalanceInUsd)
        }, ZERO_IN_BASE)

      return result
    },

    abbreviatedTotalBalanceToString(): string {
      const { totalBalanceInUsd } = this

      if (totalBalanceInUsd.eq(0)) {
        return '0.00'
      }

      if (totalBalanceInUsd.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return getAbbreviatedVolume(totalBalanceInUsd)
    },

    totalBalanceInBtc(): BigNumberInBase {
      const { totalBalance, btcUsdPrice } = this

      if (!btcUsdPrice) {
        return ZERO_IN_BASE
      }

      return totalBalance.dividedBy(new BigNumberInBase(btcUsdPrice))
    },

    totalBalanceInBtcToString(): string {
      const { totalBalanceInBtc } = this

      if (totalBalanceInBtc.eq('0')) {
        return '0.00'
      }

      if (totalBalanceInBtc.lte('0.0001')) {
        return '< 0.0001'
      }

      return totalBalanceInBtc.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    }
  },

  methods: {
    toggleHideBalances() {
      const { hideBalances } = this

      this.$emit('update:hide-balances', !hideBalances)
    },

    handleDepositClick() {
      this.$root.$emit('bridge:deposit')
    },

    handleWithdrawClick() {
      this.$root.$emit('bridge:withdraw')
    }
  }
})
</script>
