<template>
  <div class="relative">
    <div class="mb-6">
      <v-search
        dense
        name="search"
        class="max-w-xs"
        :placeholder="$t('funding.filter')"
        :search="search"
        @searched="handleInputOnSearch"
      />
    </div>
    <div class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full">
      <TableHeader v-if="isUserWalletConnected" class="md:hidden xl:grid">
        <span class="col-span-2">
          {{ $t('funding.asset') }}
        </span>
        <span class="col-span-2 flex items-center">
          <div>
            {{ $t('funding.total') }}
          </div>
          <v-icon-info-tooltip
            class="ml-2"
            color="text-gray-200"
            :tooltip="$t('funding.totalTooltip')"
            lg
          />
        </span>
        <span class="col-span-3">
          {{ $t('common.value') }}
        </span>
        <span class="col-span-5"> </span>
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
import Vue, { PropType } from 'vue'
import {
  BankBalanceWithTokenAndBalanceWithUsdBalance,
  INJECTIVE_DENOM
} from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'
import VBalance from './balance.vue'
import VSearch from '~/components/elements/search.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    VBalance,
    VSearch
  },

  props: {
    balances: {
      required: true,
      type: Array as PropType<BankBalanceWithTokenAndBalanceWithUsdBalance[]>
    }
  },

  data() {
    return {
      search: ''
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    filteredBalances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const { balances, search } = this

      return balances.filter(({ token }) => {
        if (!search || search.trim() === '') {
          return true
        }

        return token.symbol
          .toLowerCase()
          .trim()
          .includes(search.toLowerCase().trim())
      })
    },

    // sort INJ to the top
    sortedBalances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const { filteredBalances } = this

      return [...filteredBalances].sort(
        (
          v1: BankBalanceWithTokenAndBalanceWithUsdBalance,
          v2: BankBalanceWithTokenAndBalanceWithUsdBalance
        ) => {
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
  },

  methods: {
    handleInputOnSearch(search: string) {
      this.search = search
    }
  }
})
</script>
