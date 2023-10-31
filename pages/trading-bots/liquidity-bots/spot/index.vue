<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '@/app/utils/constants'
import { getSgtContractAddressFromSlug } from '@/app/utils/helpers'

definePageMeta({
  middleware: ['markets', 'grid-strategy-subaccount']
})

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
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

function fetchData() {
  status.setLoading()
  const marketId = gridStrategyStore.spotMarket!.marketId

  Promise.all([
    authZStore.fetchGrants(),
    spotStore.fetchTrades({ marketId }),
    spotStore.fetchOrderbook(marketId),
    accountStore.streamBankBalance(),
    gridStrategyStore.fetchStrategies(),
    exchangeStore.getMarketsHistory({
      marketIds: [gridStrategyStore.spotMarket!.marketId],
      resolution: MARKETS_HISTORY_CHART_ONE_HOUR * 24,
      countback: 30
    }),
    accountStore.fetchAccountPortfolio(),
    accountStore.streamSubaccountBalance(marketId)
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
  fetchData()
})

watch(() => gridStrategyStore.spotMarket, fetchData)
</script>

<template>
  <div class="min-h-screen pt-4 md:pt-10 pb-10">
    <div class="w-full max-w-xl mx-auto">
      <div class="pb-10">
        <PartialsLiquidityBotsSpotCreateCommonTiaBanner />
      </div>

      <div class="p-6 bg-gray-900 rounded-md">
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
              <BaseIcon name="close" />
            </button>
          </div>
        </div>

        <PartialsLiquidityBotsSpotMarketSelector />

        <AppHocLoading v-bind="{ status }">
          <PartialsGridStrategySpotFormActiveStrategy
            v-if="activeStrategy"
            class="mt-4"
            v-bind="{ activeStrategy, market: gridStrategyStore.spotMarket! }"
          />

          <PartialsLiquidityBotsSpotCreate v-else />
        </AppHocLoading>
      </div>
    </div>
  </div>
</template>
