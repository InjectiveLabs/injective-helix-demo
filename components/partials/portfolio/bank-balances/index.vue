<template>
  <div>
    <div class="relative max-w-full">
      <div class="relative">
        <div class="mb-6 flex justify-between items-center flex-wrap">
          <v-search
            dense
            name="search"
            class="sm:max-w-xs"
            :placeholder="$t('portfolio.filter')"
            :search="search"
            @searched="handleInputOnSearch"
          />

          <v-checkbox v-model="hideSmallBalance" class="mt-4 sm:mt-0 ml-auto">
            <span class="flex items-center">
              {{ $t('portfolio.hideSmallBalances') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('portfolio.hideSmallBalancesTooltip')"
              />
            </span>
          </v-checkbox>
        </div>
        <div
          class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full"
        >
          <TableHeader
            v-if="isUserWalletConnected && sortedBalances.length > 0"
            class="md:hidden xl:grid"
          >
            <span class="col-span-2">
              {{ $t('portfolio.asset') }}
            </span>
            <span class="col-span-2 flex items-center justify-end">
              <div>
                {{ $t('portfolio.total') }}
              </div>
            </span>
            <span class="col-span-4 text-right">
              {{ $t('common.value') }}
            </span>
            <span class="col-span-4"> </span>
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
              :hide-balance="hideBalance"
            />
            <template slot="empty">
              <span class="col-span-1 md:col-span-5">
                <div class="grow m-auto text-center py-8">
                  <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
                  <p>{{ $t('portfolio.empty') }}</p>
                </div>
              </span>
            </template>
          </TableBody>
          <v-user-wallet-connect-warning v-else cta />
        </div>
      </div>
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
    bankBalancesWithUsdBalance: {
      required: true,
      type: Array as PropType<BankBalanceWithTokenAndBalanceWithUsdBalance[]>
    },

    hideBalance: {
      type: Boolean,
      default: false
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

    filteredBalances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const { bankBalancesWithUsdBalance, search, hideSmallBalance } = this

      return bankBalancesWithUsdBalance.filter(({ token, balanceInUsd }) => {
        if ((!search || search.trim() === '') && !hideSmallBalance) {
          return true
        }

        const symbol = token.symbol.toLowerCase().trim()

        const isPartOfSearchFilter = symbol.includes(
          search.toLowerCase().trim()
        )
        const isNotSmallBalance =
          !hideSmallBalance || new BigNumberInBase(balanceInUsd).gte('10')

        return isPartOfSearchFilter && isNotSmallBalance
      })
    },

    sortedBalances(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
      const { filteredBalances } = this

      return [...filteredBalances].sort(
        (
          v1: BankBalanceWithTokenAndBalanceWithUsdBalance,
          v2: BankBalanceWithTokenAndBalanceWithUsdBalance
        ) => {
          const v1balance = new BigNumberInBase(v1.balanceInUsd)
          const v2balance = new BigNumberInBase(v2.balanceInUsd)

          // sort by balanceInUsd
          if (v1balance.gt(0) || v2balance.gt(0)) {
            return v2balance.minus(v1balance).toNumber()
          }

          // sort alphabetically - sort INJ to the top
          if (v1.denom === INJECTIVE_DENOM && v1balance.eq(0)) {
            return -1
          }

          if (v2.denom === INJECTIVE_DENOM && v2balance.eq(0)) {
            return 1
          }

          return v1.token.symbol.localeCompare(v2.token.symbol)
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
