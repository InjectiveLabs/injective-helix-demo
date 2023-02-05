<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'
import { AccountBalance, BalanceHeaderType } from '@/types'
import { usdcTokenDenoms } from '@/app/data/token'

const props = defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const searchQuery = ref('')
const showMarginCurrencyOnly = ref(false)
const hideSmallBalances = ref(false)
const sortBy = ref(BalanceHeaderType.None)
const ascending = ref(false)

const aggregatedUsdcBalance = computed(() => {
  const usdcBalances = props.balances.filter((balance) =>
    usdcTokenDenoms.includes(balance.token.denom.toLowerCase())
  )

  if (!usdcBalances.length) {
    return
  }

  return usdcBalances.reduce((aggregatedUsdc, balance) => {
    return {
      ...balance,
      denom: usdcTokenDenoms.join('-'),
      balanceToBase: new BigNumberInBase(aggregatedUsdc.balanceToBase)
        .plus(balance.balanceToBase)
        .toFixed(),
      totalBalanceInUsd: new BigNumberInBase(aggregatedUsdc.totalBalanceInUsd)
        .plus(balance.totalBalanceInUsd)
        .toFixed(),
      totalBalance: new BigNumberInBase(aggregatedUsdc.totalBalance)
        .plus(balance.totalBalance)
        .toFixed(),
      reservedBalance: new BigNumberInBase(aggregatedUsdc.reservedBalance)
        .plus(balance.reservedBalance)
        .toFixed(),
      balance: new BigNumberInBase(aggregatedUsdc.balance)
        .plus(balance.balance)
        .toFixed()
    }
  })
})

const filteredBalances = computed(() => {
  return props.balances
    .filter((balance) => balance)
    .filter((balance) => {
      const isNotSmallBalance =
        !hideSmallBalances.value ||
        new BigNumberInBase(balance.totalBalance).gte('10')

      const isMarginCurrency =
        !showMarginCurrencyOnly.value ||
        QUOTE_DENOMS_GECKO_IDS.includes(balance.token.coinGeckoId)

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
  const result = [...filteredBalances.value].sort(
    (a: AccountBalance, b: AccountBalance) => {
      switch (sortBy.value) {
        case BalanceHeaderType.Total: {
          const totalA = new BigNumberInBase(a.totalBalance)
          const totalB = new BigNumberInBase(b.totalBalance)

          if (totalA.eq(totalB)) {
            return 0
          }

          return totalB.minus(totalA).toNumber()
        }

        case BalanceHeaderType.Wallet: {
          const totalA = new BigNumberInBase(a.bankBalance)
          const totalB = new BigNumberInBase(b.bankBalance)

          if (totalA.eq(totalB)) {
            return 0
          }

          return totalB.minus(totalA).toNumber()
        }

        case BalanceHeaderType.TradingAccount: {
          const totalA = new BigNumberInBase(a.subaccountBalance)
          const totalB = new BigNumberInBase(b.subaccountBalance)

          if (totalA.eq(totalB)) {
            return 0
          }

          return totalB.minus(totalA).toNumber()
        }

        case BalanceHeaderType.Value: {
          const totalInUsdA = new BigNumberInBase(a.totalBalanceInUsd)
          const totalInUsdB = new BigNumberInBase(b.totalBalanceInUsd)

          if (totalInUsdA.eq(totalInUsdB)) {
            return 0
          }

          return totalInUsdB.minus(totalInUsdA).toNumber()
        }

        case BalanceHeaderType.Available: {
          const availableA = new BigNumberInBase(a.balanceToBase)
          const availableB = new BigNumberInBase(a.balanceToBase)

          if (availableA.eq(availableB)) {
            return 0
          }

          return availableB.minus(availableA).toNumber()
        }

        default: {
          const nameA = a.token.name
          const nameB = b.token.name

          return nameB.localeCompare(nameA)
        }
      }
    }
  )

  return ascending.value ? result.reverse() : result
})

const sortedNonUsdcBalances = computed(() =>
  sortedBalances.value.filter(
    (balance) => !usdcTokenDenoms.includes(balance.token.denom.toLowerCase())
  )
)

const sortedUsdcBalances = computed(() =>
  sortedBalances.value.filter((balance) =>
    usdcTokenDenoms.includes(balance.token.denom.toLowerCase())
  )
)
</script>

<template>
  <div>
    <PartialsAccountBalancesActions
      v-model:search="searchQuery"
      v-model:show-margin-currency-only="showMarginCurrencyOnly"
      v-model:hide-small-balances="hideSmallBalances"
    />

    <table class="w-full border-collapse hidden lg:table">
      <PartialsAccountBalancesTableHeader
        v-model:sort-by="sortBy"
        v-model:ascending="ascending"
      />
      <PartialsAccountBalancesUsdc
        v-if="aggregatedUsdcBalance && sortedUsdcBalances.length"
        :aggregated-balance="aggregatedUsdcBalance"
        :balances="sortedUsdcBalances"
        :hide-balances="hideBalances"
      />
      <template
        v-for="balance in sortedNonUsdcBalances"
        :key="balance.token.denom"
      >
        <PartialsAccountBalancesTableRow
          :balance="balance"
          :hide-balances="hideBalances"
        />
      </template>
    </table>

    <table class="w-full border-collapse sm:table lg:hidden">
      <PartialsAccountBalancesTableHeaderMobile
        v-model:sort-by="sortBy"
        v-model:ascending="ascending"
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
