<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'
import { AccountBalance, BalanceHeaderType } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

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

const searchQuery = ref('')
const showMarginCurrencyOnly = ref(false)
const hideSmallBalances = ref(false)
const sortBy = ref(BalanceHeaderType.None)
const ascending = ref(false)

const transformedBalance = computed(() => {
  const nonUsdcBalances = props.balances.filter(
    (balance) =>
      ![
        usdcTokenDenom.USDC,
        usdcTokenDenom.USDCet,
        usdcTokenDenom.USDCso
      ].includes(balance.token.denom.toLowerCase())
  )

  const usdcBalances = props.balances.filter((balance) =>
    [
      usdcTokenDenom.USDC,
      usdcTokenDenom.USDCet,
      usdcTokenDenom.USDCso
    ].includes(balance.token.denom.toLowerCase())
  )

  if (!usdcBalances.length) {
    return nonUsdcBalances
  }

  const aggregatedUsdcBalances = usdcBalances.reduce(
    (aggregatedUsdc, balance) => {
      return {
        ...balance,
        denom: '',
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
          .toFixed(),
        token: {
          ...([usdcTokenDenom.USDC].includes(balance.token.denom.toLowerCase())
            ? balance.token
            : aggregatedUsdc.token),
          denom: ''
        }
      }
    }
  )

  return [...nonUsdcBalances, aggregatedUsdcBalances]
})

const filteredBalances = computed(() => {
  return transformedBalance.value.filter((balance) => {
    if (!balance) {
      return false
    }

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
      <template v-for="balance in sortedBalances" :key="balance.token.denom">
        <PartialsAccountBalancesTableRow
          v-if="balance.token.denom"
          :balance="balance"
          :hide-balances="hideBalances"
        />
        <PartialsAccountBalancesUsdcBalances
          v-else
          :balances="balances"
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
