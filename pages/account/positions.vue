<script lang="ts" setup>
import { UiPosition, BalanceWithToken } from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { AccountBalance, Modal } from '@/types'

defineProps({
  isHideBalances: Boolean,
  isPositionsLoading: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const modalStore = useModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

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
const selectedPosition = ref<UiPosition | undefined>(undefined)

const markets = computed(() => derivativeStore.markets)
const positions = computed(() => positionStore.subaccountPositions)

const marketIds = computed(() => {
  if (!marketDenom.value) {
    return []
  }

  return markets.value
    .filter((m) => {
      return (
        m.baseToken.denom === marketDenom.value ||
        m.quoteToken.denom === marketDenom.value
      )
    })
    .map(({ marketId }) => marketId)
})

const filteredPositions = computed(() =>
  positionStore.subaccountPositions.filter((position) => {
    const positionMatchedSide = !side.value || position.direction === side.value
    const positionMatchedMarket =
      marketIds.value.length === 0 ||
      marketIds.value.includes(position.marketId)

    return positionMatchedMarket && positionMatchedSide
  })
)

const supportedTokens = computed(() => {
  const tokens = markets.value.reduce((tokens, market) => {
    const baseToken = {
      balance: '',
      denom: market.baseToken.denom,
      token: market.baseToken
    } as BalanceWithToken

    const quoteToken = {
      balance: '',
      denom: market.quoteDenom,
      token: market.quoteToken
    } as BalanceWithToken

    return [...tokens, baseToken, quoteToken]
  }, [] as BalanceWithToken[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const marketOptions = computed(() =>
  supportedTokens.value.map(({ token }) => {
    return {
      display: token.symbol,
      value: token.denom
    }
  })
)

const isEmpty = computed(() => {
  if (filteredPositions.value.length === 0) {
    return true
  }

  const hasUnavailableMarkets = filteredPositions.value.every(
    (position) =>
      markets.value.findIndex((m) => m.marketId === position.marketId) === -1
  )

  return hasUnavailableMarkets
})

onBeforeUnmount(() => {
  derivativeStore.cancelMarketsMarkPrices()
  positionStore.cancelSubaccountPositionsStream()
})

function onCloseAllPositions() {
  return positions.value.length === 1 ? closePosition() : closeAllPositions()
}

function closeAllPositions() {
  positionStore
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

  positionStore
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

function onSharePosition(position: UiPosition) {
  selectedPosition.value = position
  modalStore.openModal(Modal.SharePosition)
}

watch(
  () => accountStore.subaccountId,
  () => {
    positionStore.fetchSubaccountPositions()
  }
)
</script>

<template>
  <AppHocLoading :is-loading="isPositionsLoading">
    <div class="relative overflow-auto">
      <PartialsAccountPositionsActions
        v-model:market-denom="marketDenom"
        v-model:side="side"
        :market-options="marketOptions"
        :side-options="sideOptions"
        @positions:close="onCloseAllPositions"
      />

      <table class="w-full border-collapse hidden md:table">
        <PartialsCommonSubaccountPositionHeader is-account />

        <PartialsCommonSubaccountPositionRow
          v-for="(position, i) in filteredPositions"
          :key="`position-${i}`"
          v-bind="{
            position,
            isHideBalances
          }"
          is-account
          @share:position="onSharePosition"
        />
      </table>

      <table class="w-full border-collapse table md:hidden">
        <PartialsCommonSubaccountPositionMobile
          v-for="(position, i) in filteredPositions"
          :key="`position-mobile-${i}`"
          v-bind="{
            position,
            isHideBalances
          }"
          @share:position="onSharePosition"
        />
      </table>

      <CommonEmptyList
        v-if="isEmpty"
        class="min-h-3xs bg-gray-900"
        data-cy="markets-no-data-table"
        :message="$t('account.positions.empty')"
      >
        <span class="mt-2 text-xs text-gray-500">
          {{ $t('account.positions.empty') }}
        </span>
      </CommonEmptyList>

      <ModalsSharePosition
        v-if="selectedPosition"
        v-bind="{ position: selectedPosition }"
      />
    </div>
  </AppHocLoading>
</template>
