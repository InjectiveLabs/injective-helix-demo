<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { PropType } from 'vue'
import { INJ_DENOM } from '@injectivelabs/sdk-ui-ts'
import {
  AccountBalance,
  AccountBalanceWithAggregatedType,
  AggregatedBalanceType,
  BalanceHeaderType
} from '@/types'
import { usdcTokenDenoms } from '@/app/data/token'
import {
  QUOTE_DENOMS_GECKO_IDS,
  SMALL_BALANCE_THRESHOLD
} from '@/app/utils/constants'

const props = defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const { aggregateBalanceByDenoms, getAccountBalancesWithTokenInBases } =
  useBalance()
const searchQuery = ref('')
const showMarginCurrencyOnly = ref(false)
const hideSmallBalances = ref(false)
const sortBy = ref(BalanceHeaderType.Value)
const ascending = ref(false)

const balances = computed(() => props.balances)
const balancesInBase = computed(() =>
  getAccountBalancesWithTokenInBases(balances)
)

const balancesWithAggregation = computed<AccountBalanceWithAggregatedType[]>(
  () => {
    const aggregatedUsdcBalance = aggregateBalanceByDenoms({
      balances: balancesInBase.value,
      denoms: usdcTokenDenoms
    })

    const aggregatedUsdcBalanceWithType = aggregatedUsdcBalance
      ? [{ ...aggregatedUsdcBalance, type: AggregatedBalanceType.Aggregated }]
      : []

    const balanceWithoutAggregationDenoms = balancesInBase.value.filter(
      (balance) => !usdcTokenDenoms.includes(balance.token.denom)
    )

    return [
      ...balanceWithoutAggregationDenoms,
      ...aggregatedUsdcBalanceWithType
    ]
  }
)

const filteredBalances = computed(() => {
  return balancesWithAggregation.value.filter((balance) => {
    const isNotSmallBalance =
      !hideSmallBalances.value ||
      new BigNumberInBase(balance.accountTotalBalanceInUsd).gte(
        SMALL_BALANCE_THRESHOLD
      )

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
          const totalA = new BigNumberInBase(a.accountTotalBalance)
          const totalB = new BigNumberInBase(b.accountTotalBalance)

          if (totalA.eq(totalB)) {
            return b.token.symbol.localeCompare(a.token.symbol)
          }

          return totalB.minus(totalA).toNumber()
        }

        case BalanceHeaderType.Value: {
          const totalInUsdA = new BigNumberInBase(a.accountTotalBalanceInUsd)
          const totalInUsdB = new BigNumberInBase(b.accountTotalBalanceInUsd)

          if (totalInUsdA.eq(totalInUsdB)) {
            return b.token.symbol.localeCompare(a.token.symbol)
          }

          return totalInUsdB.minus(totalInUsdA).toNumber()
        }

        case BalanceHeaderType.Available: {
          const availableA = new BigNumberInBase(a.availableMargin)
          const availableB = new BigNumberInBase(a.availableMargin)

          if (availableA.eq(availableB)) {
            return b.token.symbol.localeCompare(a.token.symbol)
          }

          return availableB.minus(availableA).toNumber()
        }

        default: {
          return b.token.symbol.localeCompare(a.token.symbol)
        }
      }
    }
  )

  const sortedBalances = ascending.value ? result.reverse() : result

  const injBalance = sortedBalances.find(({ denom }) => denom === INJ_DENOM)

  const sortedBalancesWithoutInjBalance = sortedBalances.filter(
    ({ denom }) => denom !== INJ_DENOM
  )

  // always sort INJ on top
  return [
    ...(injBalance ? [injBalance] : []),
    ...sortedBalancesWithoutInjBalance
  ]
})

const sortedBalancesWithInjAggregation = computed(() => {
  return sortedBalances.value.map((balance) => {
    if (balance.denom === INJ_DENOM) {
      return {
        ...balance,
        type: AggregatedBalanceType.Inj
      }
    }

    return balance
  })
})

const usdcAggregationTypeBalances = computed(() =>
  balancesInBase.value.filter((balance) =>
    usdcTokenDenoms.includes(balance.token.denom)
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
      <PartialsAccountBalancesHeader
        v-bind="$attrs"
        v-model:sort-by="sortBy"
        v-model:ascending="ascending"
      />

      <template v-for="balance in sortedBalancesWithInjAggregation">
        <PartialsAccountBalancesInj
          v-if="balance.type === AggregatedBalanceType.Inj"
          :key="`inj-${balance.denom}`"
          v-bind="{
            ...$attrs,
            balance,
            hideBalances
          }"
        />

        <PartialsAccountBalancesAggregated
          v-else-if="balance.type === AggregatedBalanceType.Aggregated"
          :key="`aggregated-${balance.denom}`"
          v-bind="{
            ...$attrs,
            hideBalances,
            balances: usdcAggregationTypeBalances,
            aggregatedBalance: balance
          }"
        />

        <PartialsAccountBalancesRow
          v-else
          :key="balance.denom"
          v-bind="{
            ...$attrs,
            balance,
            hideBalances
          }"
        />
      </template>
    </table>

    <table class="w-full border-collapse table lg:hidden">
      <PartialsAccountBalancesMobileHeader
        v-model:sort-by="sortBy"
        v-model:ascending="ascending"
      />

      <PartialsAccountBalancesMobileRow
        v-for="balance in sortedBalances"
        :key="`mobile-${balance.denom}`"
        v-bind="$attrs"
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
