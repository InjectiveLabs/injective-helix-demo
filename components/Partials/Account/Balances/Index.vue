<script lang="ts" setup>
import { PropType } from 'vue'
import {
  ETH_COIN_GECKO_ID,
  USDT_COIN_GECKO_ID,
  UST_COIN_GECKO_ID
} from '@/app/utils/constants'
import { AccountBalance, BalanceHeaderType } from '@/types'

const props = defineProps({
  hideBalances: {
    type: Boolean,
    required: true
  },

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const { value: searchQuery } = useField<string>(
  'searchQuery',
  {},
  { initialValue: '' }
)
const showMarginCurrencyOnly = ref(false)
const hideSmallBalances = ref(false)
const sortBy = ref(BalanceHeaderType.None)
const ascending = ref(false)

const filteredBalances = computed(() => {
  return props.balances.filter((balance) => {
    if (!balance) {
      return false
    }

    const combinedBalance = balance.bankBalance.plus(
      balance.subaccountAvailableBalance
    )

    const isNotSmallBalance =
      !hideSmallBalances.value || combinedBalance.gte('10')

    const isMarginCurrency =
      !showMarginCurrencyOnly.value ||
      [ETH_COIN_GECKO_ID, UST_COIN_GECKO_ID, USDT_COIN_GECKO_ID].includes(
        balance.token.coinGeckoId
      )

    const tokenNameMatch = balance.token.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())

    const tokenSymbolMatch = balance.token.symbol
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())

    const isPartOfSearchFilter =
      searchQuery.value.trim() === '' || tokenNameMatch || tokenSymbolMatch

    return isPartOfSearchFilter && isNotSmallBalance && isMarginCurrency
  })
})

const sortedBalances = computed(() => {
  const multiplier = ascending.value ? 1 : -1

  const result = [...filteredBalances.value]

  result.sort((a: AccountBalance, b: AccountBalance) => {
    switch (sortBy.value) {
      case BalanceHeaderType.Total: {
        const totalA = a.bankBalance.plus(a.subaccountTotalBalance).toNumber()
        const totalB = b.bankBalance.plus(b.subaccountTotalBalance).toNumber()

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
})

function handleSearch(val: string) {
  searchQuery.value = val
}

function toggleShowMarginCurrencyOnly() {
  showMarginCurrencyOnly.value = !showMarginCurrencyOnly.value
}

function toggleHideSmallBalances() {
  hideSmallBalances.value = !hideSmallBalances.value
}

function handleSort(type: string) {
  if (type !== sortBy.value) {
    sortBy.value = type as BalanceHeaderType
  }
}

function handleAscending(value: boolean) {
  ascending.value = value
}
</script>

<template>
  <div>
    <PartialsAccountBalancesActions
      :search-query="searchQuery"
      :show-margin-currency-only="showMarginCurrencyOnly"
      :hide-small-balances="hideSmallBalances"
      @update:search="handleSearch"
      @update:show-margin-currency-only="toggleShowMarginCurrencyOnly"
      @update:hide-small-balances="toggleHideSmallBalances"
    />

    <table class="w-full border-collapse hidden lg:table">
      <PartialsAccountBalancesTableHeader
        :sort-by="sortBy"
        :ascending="ascending"
        @update:sort-by="handleSort"
        @update:ascending="handleAscending"
      />

      <PartialsAccountBalancesTableRow
        v-for="balance in sortedBalances"
        :key="balance.token.denom"
        :balance="balance"
        :hide-balances="hideBalances"
      />
    </table>

    <table class="w-full border-collapse lg:hidden">
      <PartialsAccountBalancesTableHeaderMobile
        :sort-by="sortBy"
        :ascending="ascending"
        @update:sort-by="handleSort"
        @update:ascending="handleAscending"
      />

      <PartialsAccountBalancesTableRowMobile
        v-for="balance in sortedBalances"
        :key="balance.token.denom"
        :balance="balance"
        :hide-balances="hideBalances"
      />
    </table>

    <CommonEmptyList
      v-if="sortedBalances.length === 0"
      class="min-h-3xs bg-gray-900"
      data-cy="markets-no-data-table"
      :message="$t('account.balances.empty')"
    >
      <span class="mt-2 text-xs text-gray-500">
        {{ $t('account.balances.empty') }}
      </span>
    </CommonEmptyList>
  </div>
</template>
