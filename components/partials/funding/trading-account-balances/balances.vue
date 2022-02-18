<template>
  <div class="relative">
    <div class="mb-6 flex justify-between items-center flex-wrap">
      <v-search
        dense
        name="search"
        class="sm:max-w-xs"
        :placeholder="$t('funding.filter')"
        :search="search"
        @searched="handleInputOnSearch"
      />

      <v-checkbox v-model="hideSmallBalance" class="mt-4 sm:mt-0 ml-auto">
        {{ $t('funding.hideSmallBalances') }}
      </v-checkbox>
    </div>
    <div class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full">
      <TableHeader
        v-if="isUserWalletConnected && sortedBalances.length > 0"
        class="md:hidden xl:grid"
      >
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
        <span class="col-span-2">
          {{ $t('funding.available') }}
        </span>
        <span class="col-span-2">
          {{ $t('funding.inOrder') }}
        </span>
        <span class="col-span-2">
          {{ $t('common.value') }}
        </span>
        <span class="col-span-2"> </span>
      </TableHeader>

      <TableBody
        v-if="isUserWalletConnected"
        :show-empty="sortedBalances.length === 0"
      >
        <v-balance
          v-for="(balance, index) in sortedBalances"
          :key="`balance-${index}`"
          class="col-span-1"
          :balance="balance"
        />
        <template slot="empty">
          <span class="col-span-1 md:col-span-5">
            <div class="grow m-auto text-center">
              <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
              <p>{{ $t('funding.empty') }}</p>
            </div>
          </span>
        </template>
      </TableBody>
      <v-user-wallet-connect-warning v-else cta />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  SubaccountBalanceWithTokenWithUsdBalance,
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
    subaccountBalancesWithUsdBalance: {
      required: true,
      type: Array as PropType<SubaccountBalanceWithTokenWithUsdBalance[]>
    }
  },

  data() {
    return {
      search: '',
      hideSmallBalance: false
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    filteredBalances(): SubaccountBalanceWithTokenWithUsdBalance[] {
      const {
        subaccountBalancesWithUsdBalance,
        search,
        hideSmallBalance
      } = this

      return subaccountBalancesWithUsdBalance.filter(
        ({ token, balanceInUsd }) => {
          if ((!search || search.trim() === '') && !hideSmallBalance) {
            return true
          }

          const symbol = token.symbol.toLowerCase().trim()
          const isINJ = symbol === INJECTIVE_DENOM

          const isPartOfSearchFilter = symbol.includes(
            search.toLowerCase().trim()
          )
          const isNotSmallBalance =
            !hideSmallBalance ||
            isINJ ||
            new BigNumberInBase(balanceInUsd).gt('1')

          return isPartOfSearchFilter && isNotSmallBalance
        }
      )
    },

    // sort INJ to the top
    sortedBalances(): SubaccountBalanceWithTokenWithUsdBalance[] {
      const { filteredBalances } = this

      return [...filteredBalances].sort(
        (
          v1: SubaccountBalanceWithTokenWithUsdBalance,
          v2: SubaccountBalanceWithTokenWithUsdBalance
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
