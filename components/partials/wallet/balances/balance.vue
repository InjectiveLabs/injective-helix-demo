<template>
  <TableRow>
    <span class="col-span-1 font-mono text-left md:hidden">{{
      $t('Asset')
    }}</span>
    <span class="col-span-1 md:col-span-3 text-right md:text-left">
      <div class="flex items-center justify-end md:justify-start">
        <div v-if="balance.token.icon" class="w-6 h-6">
          <img
            :src="balance.token.icon"
            :alt="balance.token.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-4">
          <div class="flex items-center">
            {{ balance.token.name }}
          </div>
          <span
            class="text-gray-400 dark:text-gray-500 text-2xs md:text-xs 4xl:text-sm block"
          >
            {{ balance.token.symbol }}
          </span>
        </div>
      </div>
    </span>
    <span class="col-span-1 font-mono text-left md:hidden">{{
      $t('Injective Chain Balance')
    }}</span>
    <span
      class="col-span-1 md:col-span-3 font-mono text-right whitespace-nowrap"
    >
      <div class="flex items-center justify-end">
        {{ bankBalanceToString }}
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
          balance.token.symbol
        }}</span>
      </div>
      <div v-if="false" class="flex items-center justify-end">
        <span class="text-2xs text-aqua-500">
          &#8776; {{ bankBalanceInUsdToString }} USD
        </span>
      </div>
    </span>
    <span class="col-span-1 font-mono text-left md:hidden">{{
      $t('ERC20 Balance')
    }}</span>
    <span
      class="col-span-1 md:col-span-3 font-mono text-right whitespace-nowrap"
    >
      <div class="flex items-center justify-end">
        {{ erc20BalanceToString }}
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
          balance.token.symbol
        }}</span>
      </div>
      <div v-if="false" class="flex items-center justify-end">
        <span class="text-2xs text-aqua-500">
          &#8776; {{ erc20BalanceInUsdToString }} USD
        </span>
      </div>
    </span>
    <span class="col-span-1 font-mono text-left md:hidden">{{
      $t('Total')
    }}</span>
    <span
      class="col-span-1 md:col-span-3 font-mono text-right whitespace-nowrap"
    >
      <div class="flex items-center justify-end">
        {{ totalToString }}
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
          balance.token.symbol
        }}</span>
      </div>
      <div class="flex items-center justify-end">
        <span class="text-2xs text-aqua-500">
          &#8776; {{ totalInUsdToString }} USD
        </span>
      </div>
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  ZERO_IN_BASE,
  MAX_DISPLAYABLE_NUMBER
} from '~/app/utils/constants'
import { BankBalanceWithTokenMetaDataAndBalance } from '~/types/bank'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    balance: {
      required: true,
      type: Object as PropType<BankBalanceWithTokenMetaDataAndBalance>
    }
  },

  computed: {
    bankBalance(): BigNumberInBase {
      const { balance } = this

      if (!balance.balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.balance).toBase(balance.token.decimals)
    },

    bankBalanceToString(): string {
      const { bankBalance } = this

      if (bankBalance.gt(MAX_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return bankBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    bankBalanceInUsd(): BigNumberInBase {
      const { bankBalance, balance } = this

      return bankBalance.times(balance.token.priceInUsd || 0)
    },

    bankBalanceInUsdToString(): string {
      const { bankBalanceInUsd } = this

      if (bankBalanceInUsd.gt(MAX_DISPLAYABLE_NUMBER)) {
        return ` > ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return bankBalanceInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    erc20Balance(): BigNumberInBase {
      const { balance } = this

      if (!balance.token) {
        return ZERO_IN_BASE
      }

      if (!balance.token.balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.token.balance).toBase(
        balance.token.decimals
      )
    },

    erc20BalanceToString(): string {
      const { erc20Balance } = this

      if (erc20Balance.gt(MAX_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return erc20Balance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    erc20BalanceInUsd(): BigNumberInBase {
      const { erc20Balance, balance } = this

      return erc20Balance.times(balance.token.priceInUsd || 0)
    },

    erc20BalanceInUsdToString(): string {
      const { erc20BalanceInUsd } = this

      if (erc20BalanceInUsd.gt(MAX_DISPLAYABLE_NUMBER)) {
        return ` > ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return erc20BalanceInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    total(): BigNumberInBase {
      const { bankBalance, erc20Balance } = this

      return bankBalance.plus(erc20Balance)
    },

    totalToString(): string {
      const { total } = this

      if (total.gt(MAX_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return total.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    totalInUsd(): BigNumberInBase {
      const { total, balance } = this

      return total.times(balance.token.priceInUsd || 0)
    },

    totalInUsdToString(): string {
      const { totalInUsd } = this

      if (totalInUsd.gt(MAX_DISPLAYABLE_NUMBER)) {
        return ` > ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return totalInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
