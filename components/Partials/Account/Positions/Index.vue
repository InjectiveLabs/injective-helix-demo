<script lang="ts" setup>
import { BankBalanceWithTokenAndBalanceInBase } from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'

defineProps({
  hideBalances: Boolean
})

const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const sideOptions = [
  {
    display: t('account.positions.side.short'),
    value: 'short'
  },
  {
    display: t('account.positions.side.long'),
    value: 'long'
  }
]

const side = ref('')
const marketDenom = ref('')

const markets = computed(() => derivativeStore.markets)
const positions = computed(() => positionStore.subaccountPositions)

const marketIds = computed(() => {
  if (!marketDenom.value) {
    return []
  }

  return derivativeStore.markets
    .filter((m) => {
      return (
        m.baseToken.denom === marketDenom.value ||
        m.quoteToken.denom === marketDenom.value
      )
    })
    .map(({ marketId }) => marketId)
})

const filteredPositions = computed(() => {
  return positionStore.subaccountPositions.filter((position) => {
    const positionMatchedSide = !side.value || position.direction === side.value
    const positionMatchedMarket =
      marketIds.value.length === 0 ||
      marketIds.value.includes(position.marketId)

    return positionMatchedMarket && positionMatchedSide
  })
})

const supportedTokens = computed(() => {
  const tokens = markets.value.reduce((tokens, market) => {
    const baseToken = {
      balance: '',
      denom: market.baseToken.denom,
      token: market.baseToken
    } as BankBalanceWithTokenAndBalanceInBase

    const quoteToken = {
      balance: '',
      denom: market.quoteToken.denom,
      token: market.quoteToken
    } as BankBalanceWithTokenAndBalanceInBase

    return [...tokens, baseToken, quoteToken]
  }, [] as BankBalanceWithTokenAndBalanceInBase[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const marketOptions = computed(() => {
  return supportedTokens.value.map(({ token }) => {
    return {
      display: token.symbol,
      value: token.denom
    }
  })
})

const showEmpty = computed(() => {
  if (filteredPositions.value.length === 0) {
    return true
  }

  const hasUnavailableMarkets = filteredPositions.value.every(
    (position) =>
      markets.value.findIndex((m) => m.marketId === position.marketId) === -1
  )

  return hasUnavailableMarkets
})

function handleCloseAllPositions() {
  return positions.value.length === 1 ? closePosition() : closeAllPositions()
}

function closeAllPositions() {
  return positionStore
    .closeAllPosition(positions.value)
    .then(() => {
      success({
        title: t('trade.positions_closed')
      })
    })
    .catch($onError)
}

function closePosition() {
  const [position] = positions.value

  const market = markets.value.find((m) => m.marketId === position.marketId)

  if (!market) {
    throw new GeneralException(
      Error(
        t('trade.position_market_not_found', {
          marketId: position.marketId
        })
      )
    )
  }

  return positionStore
    .closePosition({
      position,
      market
    })
    .then(() => {
      success({
        title: t('trade.positions_closed')
      })
    })
    .catch($onError)
}
</script>

<template>
  <div>
    <PartialsAccountPositionsActions
      v-model:market-denom="marketDenom"
      v-model:side="side"
      :market-options="marketOptions"
      :side-options="sideOptions"
      @positions:close="handleCloseAllPositions"
    />

    <table class="w-full border-collapse hidden lg:table">
      <PartialsAccountPositionsTableHeader />

      <PartialsAccountPositionsTableRow
        v-for="(position, i) in filteredPositions"
        :key="`position-${i}`"
        :position="position"
        :hide-balances="hideBalances"
      />
    </table>

    <table class="w-full border-collapse table lg:hidden">
      <PartialsAccountPositionsTableRowMobile
        v-for="(position, i) in filteredPositions"
        :key="`position-${i}`"
        class=""
        :position="position"
        :hide-balances="hideBalances"
      />
    </table>

    <CommonEmptyList
      v-if="showEmpty"
      class="min-h-3xs bg-gray-900"
      data-cy="markets-no-data-table"
      :message="$t('account.positions.empty')"
    >
      <span class="mt-2 text-xs text-gray-500">
        {{ $t('account.positions.empty') }}
      </span>
    </CommonEmptyList>
  </div>
</template>
