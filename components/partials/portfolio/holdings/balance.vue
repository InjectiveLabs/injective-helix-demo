<template>
  <TableRow>
    <span class="col-span-1 font-mono text-left md:hidden">{{
      $t('Asset')
    }}</span>
    <span class="col-span-1 md:col-span-4 text-right md:text-left">
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
      $t('available')
    }}</span>
    <span
      class="col-span-1 md:col-span-4 font-mono text-right whitespace-nowrap"
    >
      <div class="flex items-center justify-end">
        {{ availableBalanceToString }}
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
          balance.token.symbol
        }}</span>
      </div>
    </span>
    <span class="col-span-1 font-mono text-left md:hidden">{{
      $t('total')
    }}</span>
    <span
      class="col-span-1 md:col-span-4 font-mono text-right whitespace-nowrap"
    >
      <div class="flex items-center justify-end">
        {{ totalBalanceToString }}
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
          balance.token.symbol
        }}</span>
      </div>
      <div class="flex items-center justify-end">
        <span class="text-2xs text-aqua-500">
          &#8776; {{ totalBalanceInUsdToString }} USD
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
import { SubaccountBalanceWithTokenMetaData } from '~/types/bank'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    balance: {
      required: true,
      type: Object as PropType<SubaccountBalanceWithTokenMetaData>
    }
  },

  computed: {
    availableBalance(): BigNumberInBase {
      const { balance } = this

      if (!balance.availableBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance).toBase(
        balance.token.decimals
      )
    },

    availableBalanceToString(): string {
      const { availableBalance } = this

      if (availableBalance.gt(MAX_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return availableBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    availableBalanceInUsd(): BigNumberInBase {
      const { availableBalance, balance } = this

      return availableBalance.times(balance.token.priceInUsd || 0)
    },

    availableBalanceInUsdToString(): string {
      const { availableBalanceInUsd } = this

      if (availableBalanceInUsd.gt(MAX_DISPLAYABLE_NUMBER)) {
        return ` > ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return availableBalanceInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    totalBalance(): BigNumberInBase {
      const { balance } = this

      if (!balance.totalBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.totalBalance).toBase(
        balance.token.decimals
      )
    },

    totalBalanceToString(): string {
      const { totalBalance } = this

      if (totalBalance.gt(MAX_DISPLAYABLE_NUMBER)) {
        return `> ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return totalBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    totalBalanceInUsd(): BigNumberInBase {
      const { totalBalance, balance } = this

      return totalBalance.times(balance.token.priceInUsd || 0)
    },

    totalBalanceInUsdToString(): string {
      const { totalBalanceInUsd } = this

      if (totalBalanceInUsd.gt(MAX_DISPLAYABLE_NUMBER)) {
        return ` > ${MAX_DISPLAYABLE_NUMBER.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return totalBalanceInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
