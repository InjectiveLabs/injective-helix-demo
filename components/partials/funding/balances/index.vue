<template>
  <div class="relative">
    <HOCLoading :status="status">
      <div class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full">
        <TableHeader v-if="isUserWalletConnected">
          <span class="col-span-3">{{ $t('Asset') }}</span>
          <span class="col-span-3">
            <div class="flex items-center">
              <span class="flex-1 text-right">{{
                $t('Injective Chain Balance')
              }}</span>
            </div>
          </span>
          <span class="col-span-3">
            <div class="flex items-center relative justify-end">
              {{ $t('ERC20 Balance') }}
            </div>
          </span>
          <span class="col-span-3">
            <div class="flex items-center relative justify-end">
              {{ $t('Total') }}
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
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BigNumberInBase,
  Status
} from '@injectivelabs/utils'
import {
  BankBalanceWithTokenAndBalanceWithUsdBalance,
  INJECTIVE_DENOM
} from '@injectivelabs/ui-common'
import VBalance from './balance.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    TableBody,
    HOCLoading,
    TableHeader,
    VBalance
  },

  props: {
    balances: {
      type: Array as PropType<BankBalanceWithTokenAndBalanceWithUsdBalance[]>,
      required: true
    },

    status: {
      type: Object as PropType<Status>,
      default: () => new Status()
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    sortedBalances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const { balances } = this

      return [...balances].sort(
        (
          v1: BankBalanceWithTokenAndBalanceWithUsdBalance,
          v2: BankBalanceWithTokenAndBalanceWithUsdBalance
        ) => {
          // sort INJ to the top
          if (v1.denom === INJECTIVE_DENOM) {
            return -1
          }

          if (v2.denom === INJECTIVE_DENOM) {
            return 1
          }

          return new BigNumberInBase(v2.balanceInUsd)
            .minus(v1.balanceInUsd)
            .toNumber()
        }
      )
    }
  }
})
</script>
