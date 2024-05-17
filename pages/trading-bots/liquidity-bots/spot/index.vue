<script lang="ts" setup>
import { OrderState } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  getSgtContractAddressFromSlug,
  addressAndMarketSlugToSubaccountId
} from '@/app/utils/helpers'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '@/app/utils/constants'
import { UiSpotMarket } from '@/types'

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))
const isBannerOpen = ref(false)

const activeStrategy = computed(
  () =>
    gridStrategyStore.activeStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(gridStrategyStore.spotMarket?.slug)
    )!
)

const subaccountId = computed(() =>
  addressAndMarketSlugToSubaccountId(
    walletStore.address,
    (gridStrategyStore.spotMarket as UiSpotMarket).slug
  )
)

const marketOrders = computed(() =>
  spotStore.subaccountOrders.filter(
    ({ marketId, subaccountId: orderSubaccountId, state }) =>
      marketId === gridStrategyStore.spotMarket?.marketId &&
      orderSubaccountId === subaccountId.value &&
      state === OrderState.Booked
  )
)

// todo: Ivan => change subaccount onMounted

function fetchData() {
  status.setLoading()

  if (!gridStrategyStore.spotMarket) {
    return
  }

  const marketId = gridStrategyStore.spotMarket.marketId
  const subaccountId = addressAndMarketSlugToSubaccountId(
    walletStore.address,
    gridStrategyStore.spotMarket.slug
  )

  spotStore.cancelOrderbookUpdateStream()
  spotStore.cancelSubaccountOrdersHistoryStream()
  spotStore.cancelTradesStream()

  Promise.all([
    authZStore.fetchGrants(),
    spotStore.streamTrades(marketId),
    spotStore.fetchOrderbook(marketId),
    spotStore.fetchTrades({ marketId }),
    spotStore.streamSubaccountOrders(marketId, subaccountId),
    spotStore.fetchOrdersBySubaccount({
      marketIds: [gridStrategyStore.spotMarket.marketId],
      subaccountId
    }),
    spotStore.fetchSubaccountOrderHistory({
      subaccountId,
      filters: {
        marketIds: [gridStrategyStore.spotMarket.marketId]
      }
    }),
    accountStore.streamBankBalance(),
    gridStrategyStore.fetchAllStrategies(),
    exchangeStore.fetchMarketHistory({
      marketIds: [gridStrategyStore.spotMarket.marketId],
      resolution: MARKETS_HISTORY_CHART_ONE_HOUR,
      countback: 30 * 24
    }),
    accountStore.fetchAccountPortfolioBalances(),
    accountStore.streamSubaccountBalance(subaccountId)
  ])
    .catch($onError)
    .finally(() => {
      if (gridStrategyStore.strategies.length === 0) {
        isBannerOpen.value = true
      }

      status.setIdle()
    })
}

onWalletConnected(() => {
  spotStore.resetOrderbookAndTrades()

  fetchData()
})

onUnmounted(() => {
  spotStore.cancelOrderbookUpdateStream()
  spotStore.cancelSubaccountOrdersStream()
  spotStore.cancelTradesStream()
})

watch(() => gridStrategyStore.spotMarket, fetchData)
</script>

<template>
  <div>
    <p class="text-xl font-semibold text-center mb-4">
      {{ $t('liquidity.liquidityBots') }}
    </p>

    <div
      v-if="isBannerOpen"
      class="bg-[#A5EBEE] text-black rounded-md px-4 py-2 flex my-4"
    >
      <div class="flex-1 pr-4">
        <p class="font-bold text-sm">{{ $t('liquidity.bannerMessage') }}</p>
        <p class="text-sm">
          {{ $t('liquidity.setUpLiquidityInAFewClicks') }}
        </p>
      </div>

      <div>
        <button @click="isBannerOpen = false">
          <SharedIcon name="close" />
        </button>
      </div>
    </div>

    <PartialsLiquidityBotsSpotMarketSelector />

    <AppHocLoading v-bind="{ status }">
      <PartialsLiquidityBotsSpotOrdersChart
        v-if="
          gridStrategyStore.spotMarket &&
          marketOrders.length > 0 &&
          activeStrategy
        "
        v-bind="{ market: gridStrategyStore.spotMarket }"
      />

      <PartialsLiquidityBotsSpotPlacingOrders
        v-else-if="activeStrategy"
        v-bind="{
          subaccountId,
          market: gridStrategyStore.spotMarket as UiSpotMarket
        }"
      />

      <PartialsGridStrategySpotFormActiveStrategy
        v-if="activeStrategy && gridStrategyStore.spotMarket"
        class="mt-4"
        v-bind="{
          activeStrategy,
          market: gridStrategyStore.spotMarket,
          isLiquidity: true
        }"
      />

      <PartialsLiquidityBotsSpotCreate v-else />
    </AppHocLoading>
  </div>
</template>
