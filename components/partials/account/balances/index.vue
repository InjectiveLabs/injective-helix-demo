<template>
  <div>
    <Actions
      :search-query="searchQuery"
      :show-margin-currency-only="showMarginCurrencyOnly"
      :hide-small-balances="hideSmallBalances"
      @update:search="handleSearch"
      @update:show-margin-currency-only="toggleShowMarginCurrencyOnly"
      @update:hide-small-balances="toggleHideSmallBalances"
    />

    <table class="w-full border-collapse hidden lg:table">
      <TableHeader
        :sort-by="sortBy"
        :ascending="ascending"
        @update:sort-by="handleSort"
      />

      <TableRow
        v-for="balance in sortedBalances"
        :key="balance.denom"
        :balance="balance"
        :hide-balances="hideBalances"
      />
    </table>

    <table class="w-full border-collapse table lg:hidden">
      <TableHeaderMobile
        :sort-by="sortBy"
        :ascending="ascending"
        @update:sort-by="handleSort"
      />

      <TableRowMobile
        v-for="balance in sortedBalances"
        :key="balance.denom"
        :balance="balance"
        :hide-balances="hideBalances"
      />
    </table>

    <EmptyList
      v-if="sortedBalances.length === 0"
      classes="bg-gray-850 min-h-3xs"
      data-cy="markets-no-data-table"
      :message="$t('account.balances.empty')"
    >
      <span class="mt-2 text-xs text-gray-500">
        {{ $t('account.balances.empty') }}
      </span>
    </EmptyList>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import TableHeader from './table-header.vue'
import TableHeaderMobile from './table-header-mobile.vue'
import TableRow from './table-row.vue'
import TableRowMobile from './table-row-mobile.vue'
import Actions from '~/components/partials/account/balances/actions.vue'
import {
  ETH_COIN_GECKO_ID,
  USDT_COIN_GECKO_ID,
  UST_COIN_GECKO_ID
} from '~/app/utils/constants'
import { AccountBalance, BalanceHeaderType } from '~/types'

export default Vue.extend({
  components: {
    Actions,
    TableHeader,
    TableHeaderMobile,
    TableRow,
    TableRowMobile
  },

  props: {
    hideBalances: {
      type: Boolean,
      required: true
    },

    balances: {
      type: Array as PropType<AccountBalance[]>,
      required: true
    }
  },

  data() {
    return {
      BalanceHeaderType,
      searchQuery: '',
      showMarginCurrencyOnly: false,
      hideSmallBalances: false,
      sortBy: BalanceHeaderType.None,
      ascending: false
    }
  },

  computed: {
    filteredBalances(): AccountBalance[] {
      const {
        balances,
        searchQuery,
        showMarginCurrencyOnly,
        hideSmallBalances
      } = this

      return balances.filter((balance) => {
        if (!balance) {
          return false
        }

        const combinedBalance = balance.bankBalance.plus(
          balance.subaccountAvailableBalance
        )

        const isNotSmallBalance =
          !hideSmallBalances || combinedBalance.gte('10')

        const isMarginCurrency =
          !showMarginCurrencyOnly ||
          [ETH_COIN_GECKO_ID, UST_COIN_GECKO_ID, USDT_COIN_GECKO_ID].includes(
            balance.token.coinGeckoId
          )

        const tokenNameMatch = balance.token.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

        const tokenSymbolMatch = balance.token.symbol
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

        const isPartOfSearchFilter = tokenNameMatch || tokenSymbolMatch

        return isPartOfSearchFilter && isNotSmallBalance && isMarginCurrency
      })
    },

    sortedBalances(): AccountBalance[] {
      const { filteredBalances, ascending, sortBy } = this

      const multiplier = ascending ? 1 : -1

      const result = [...filteredBalances]

      result.sort((a: AccountBalance, b: AccountBalance) => {
        switch (sortBy) {
          case BalanceHeaderType.Total: {
            const totalA = a.bankBalance
              .plus(a.subaccountTotalBalance)
              .toNumber()
            const totalB = b.bankBalance
              .plus(b.subaccountTotalBalance)
              .toNumber()

            if (totalA === totalB) {
              return 0
            }

            return totalA > totalB ? multiplier : multiplier * -1
          }

          case BalanceHeaderType.Value: {
            const totalInUsdA = a.bankBalance
              .plus(a.subaccountTotalBalance)
              .times(a.token.usdPrice)
              .toNumber()
            const totalInUsdB = b.bankBalance
              .plus(b.subaccountTotalBalance)
              .times(b.token.usdPrice)
              .toNumber()

            if (totalInUsdA === totalInUsdB) {
              return 0
            }

            return totalInUsdA > totalInUsdB ? multiplier : multiplier * -1
          }

          case BalanceHeaderType.Available: {
            const availableA = a.subaccountAvailableBalance.toNumber()
            const availableB = b.subaccountAvailableBalance.toNumber()

            if (availableA === availableB) {
              return 0
            }

            return availableA > availableB ? multiplier : multiplier * -1
          }

          default: {
            const nameA = a.token.name
            const nameB = b.token.name

            if (nameA === nameB) {
              return 0
            }

            return nameA > nameB ? multiplier : multiplier * -1
          }
        }
      })

      return result
    }
  },

  methods: {
    handleSearch(val: string) {
      this.searchQuery = val
    },

    toggleShowMarginCurrencyOnly() {
      this.showMarginCurrencyOnly = !this.showMarginCurrencyOnly
    },

    toggleHideSmallBalances() {
      this.hideSmallBalances = !this.hideSmallBalances
    },

    handleSort(type: BalanceHeaderType) {
      if (type !== this.sortBy) {
        this.sortBy = type
        this.ascending = false
      } else if (this.ascending) {
        this.ascending = false
      } else {
        this.ascending = true
      }
    }
  }
})
</script>
