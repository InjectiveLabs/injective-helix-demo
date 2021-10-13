<template>
  <TableRow>
    <span class="col-span-1 font-mono text-left xl:hidden">{{
      $t('Asset')
    }}</span>
    <span class="col-span-1 xl:col-span-6 text-right xl:text-left">
      <div class="flex items-center">
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
            class="text-gray-400 dark:text-gray-500 text-xs xl:text-xs 2xl:text-sm block"
          >
            {{ balance.token.symbol }}
          </span>
        </div>
      </div>
    </span>
    <span class="col-span-1 font-mono text-left xl:hidden">{{
      $t('Injective Chain Balance')
    }}</span>
    <span
      class="col-span-1 xl:col-span-3 font-mono text-right flex items-center justify-end"
    >
      {{ bankBalanceToString }}
      <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
        balance.token.symbol
      }}</span>
    </span>
    <span class="col-span-1 font-mono text-left xl:hidden">{{
      $t('ERC20 Balance')
    }}</span>
    <span class="col-span-1 xl:col-span-3 font-mono text-right">
      {{ erc20BalanceToString }}
      <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
        balance.token.symbol
      }}</span>
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  ZERO_IN_BASE
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

      return bankBalance.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
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

      return erc20Balance.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    }
  }
})
</script>
