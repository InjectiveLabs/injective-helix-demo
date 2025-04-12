<script setup lang="ts">
import { IS_MAINNET } from '@shared/utils/constant'
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { roundDustAmount } from '@/app/utils/formatters'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  IsSpotKey,
  MarketKey,
  IsRWAMarketOpenKey,
  PortfolioStatusKey,
  UiDerivativeMarket,
  MarkPriceStatusKey
} from '@/types'

const route = useRoute()
const jsonStore = useSharedJsonStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const portfolioStatus = inject(
  PortfolioStatusKey,
  new Status(StatusType.Loading)
)

const isRWAMarketOpen = ref(false)
const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  derivativeStore.markets.find(
    (market) =>
      market.slug === route.params.slug ||
      market.marketId === route.query.marketId
  )
)

useDerivativeOrderbook(computed(() => market.value))

const { lastTradedPriceInUsd: derivativeLastTradedPriceInUsd } =
  useDerivativeLastPrice(market)

onMounted(async () => {
  if (!market.value) {
    return
  }

  const isRWAMarket = jsonStore.isTradeFiMarket(market.value.marketId)

  if (!isRWAMarket) {
    return
  }

  const isRWAMarketOpenStatus = await derivativeStore.fetchRWAMarketIsOpen(
    market.value.oracleBase
  )

  if (!isRWAMarketOpenStatus) {
    notificationStore.warning({
      title: t('trade.rwa.marketClosedToast')
    })
  }

  isRWAMarketOpen.value = isRWAMarketOpenStatus
})

onWalletConnected(async () => {
  if (route.query.marketId) {
    await derivativeStore.appendMarketId(route.query.marketId as string)
  }

  if (!market.value) {
    return navigateTo({
      name: 'futures-slug',
      params: { slug: 'btc-usdt-perp' }
    })
  }

  status.setLoading()

  Promise.all([
    derivativeStore.fetchTrades({
      marketId: market.value.marketId,
      executionSide: TradeExecutionSide.Taker
    }),
    derivativeStore.getMarketMarkPrice(market.value)
  ])
    .catch($onError)
    .finally(() => status.setIdle())

  derivativeStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()

  await until(portfolioStatus).toMatch((status) => status.isIdle())

  derivativeStore.streamSubaccountOrders({ marketId: market.value.marketId })
  derivativeStore.streamSubaccountOrderHistory({
    marketId: market.value.marketId
  })
  derivativeStore.streamSubaccountTrades({ marketId: market.value.marketId })

  derivativeStore.streamTrades({
    marketId: market.value.marketId,
    onResetCallback: () =>
      derivativeStore.fetchTrades({
        marketId: (market.value as UiDerivativeMarket).marketId
      })
  })
  derivativeStore.streamMarketsMarkPrices({
    marketIds: [
      ...new Set([
        market.value.marketId,
        ...positionStore.positions.map(({ marketId }) => marketId),
        ...gridStrategyStore.strategies.map(({ marketId }) => marketId)
      ])
    ]
  })
})

useHead({
  title: computed(() => {
    const price = !derivativeLastTradedPriceInUsd.value.eq(0)
      ? `$${roundDustAmount({
          value: derivativeLastTradedPriceInUsd.value.toFixed(),
          decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
        })} |`
      : ''

    const ticker = market.value ? `${market.value.ticker} |` : ''

    return `${price} ${ticker} Helix`
  })
})

onUnmounted(() => {
  derivativeStore.reset()
  derivativeStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()
})

useIntervalFn(
  async () => {
    if (!market.value || !IS_MAINNET) {
      return
    }

    const isRWAMarket = jsonStore.isTradeFiMarket(market.value.marketId)

    if (!isRWAMarket) {
      return
    }

    const isRWAMarketOpenStatus = await derivativeStore.fetchRWAMarketIsOpen(
      market.value.oracleBase
    )

    isRWAMarketOpen.value = isRWAMarketOpenStatus
  },
  5 * 60 * 1000
)

provide(MarketKey, market)
provide(IsSpotKey, false)
provide(MarkPriceStatusKey, status)
provide(IsRWAMarketOpenKey, isRWAMarketOpen)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }">
    <template #form>
      <PartialsTradeFuturesForm />
    </template>

    <template #orders>
      <PartialsTradeFuturesOrders />
    </template>
  </PartialsTradeLayout>

  <ModalsIAssets />
  <ModalsMarketRestricted v-if="market" v-bind="{ market }" />
</template>
