<template>
  <div>
    <div class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full">
      <TableHeader v-if="isUserWalletConnected">
        <span class="col-span-4">{{ $t('Asset') }}</span>
        <span class="col-span-4">
          <div class="flex items-center justify-end">
            <span>{{ $t('available') }}</span>
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('available_subaccount_balance_tooltip')"
            />
          </div>
        </span>
        <span class="col-span-4">
          <div class="flex items-center relative justify-end">
            {{ $t('total') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('total_subaccount_balance_tooltip')"
            />
          </div>
        </span>
      </TableHeader>

      <TableBody
        v-if="isUserWalletConnected"
        :show-empty="balances.length === 0"
      >
        <v-balance
          v-for="(balance, index) in sortedBalances"
          :key="`balance-${index}`"
          class="col-span-1"
          :balance="balance"
        />
        <template slot="empty">
          <span class="col-span-1 md:col-span-3 text-center md:text-left">{{
            $t('There are no results found - Balances')
          }}</span>
        </template>
      </TableBody>
      <v-user-wallet-connect-warning v-else cta />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import VBalance from './balance.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import { UiSubaccount } from '~/types'
import {
  SubaccountBalanceWithTokenMetaData,
  SubaccountBalanceWithTokenMetaDataWithUsdBalance
} from '~/types/bank'
import { INJECTIVE_DENOM } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    VBalance
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    subaccountBalanceWithTokenMetaData(): SubaccountBalanceWithTokenMetaData[] {
      return this.$accessor.account.subaccountBalancesWithTokenMetaData
    },

    balances(): SubaccountBalanceWithTokenMetaDataWithUsdBalance[] {
      const { subaccount, subaccountBalanceWithTokenMetaData } = this

      if (!subaccount) {
        return []
      }

      return subaccountBalanceWithTokenMetaData.map((balance) => {
        const balanceInUsd = new BigNumberInWei(balance.totalBalance)
          .toBase(balance.token.decimals)
          .times(balance.token.priceInUsd || 0)

        return {
          ...balance,
          balanceInUsd
        }
      }) as SubaccountBalanceWithTokenMetaDataWithUsdBalance[]
    },

    sortedBalances(): SubaccountBalanceWithTokenMetaDataWithUsdBalance[] {
      const { balances } = this

      return [...balances].sort(
        (
          v1: SubaccountBalanceWithTokenMetaDataWithUsdBalance,
          v2: SubaccountBalanceWithTokenMetaDataWithUsdBalance
        ) => {
          // sort INJ to the top
          if (v1.denom === INJECTIVE_DENOM) {
            return -1
          }

          if (v2.denom === INJECTIVE_DENOM) {
            return 1
          }

          return v2.balanceInUsd.minus(v1.balanceInUsd).toNumber()
        }
      )
    }
  }
})
</script>
