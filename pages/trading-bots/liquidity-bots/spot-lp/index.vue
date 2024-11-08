<script setup lang="ts">
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { spotGridMarkets } from '@/app/json'
import {
  calculateOrderLevels,
  volatilityStrategyBounds
} from '@/app/data/grid-strategy'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '@/app/utils/constants'
import { LiquidityBotField, LiquidityBotForm } from '@/types'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()

const { values } = useForm<LiquidityBotForm>()

const status = reactive(new Status(StatusType.Loading))

const market = useQueryRef('market', 'inj-usdt')

const lastTradedPrice = ref<BigNumberInBase>(ZERO_IN_BASE)

const marketOptions = computed(() =>
  spotStore.markets
    .filter(({ slug }) =>
      spotGridMarkets.some((market) => market.slug === slug)
    )
    .map((market) => ({
      label: market.ticker,
      value: market.slug,
      avatar: {
        src: market.baseToken.logo
      }
    }))
    .toSorted((a, b) => {
      if (a.value === 'inj-usdt') return -1
      if (b.value === 'inj-usdt') return 1
      return a.label.localeCompare(b.label)
    })
)

const selectedMarket = computed(() =>
  spotStore.markets.find((m) => m.slug === market.value)
)

const liquidityValues = computed(() => {
  const currentPrice = new BigNumberInBase(lastTradedPrice.value)

  const upperBound = currentPrice.plus(
    currentPrice.times(
      volatilityStrategyBounds[values[LiquidityBotField.Volatility]]
        ?.priceBounds || 0
    )
  )

  const lowerBound = currentPrice.minus(
    currentPrice.times(
      volatilityStrategyBounds[values[LiquidityBotField.Volatility]]
        ?.priceBounds || 0
    )
  )

  const trailingUpperBound = currentPrice.plus(
    currentPrice.times(
      volatilityStrategyBounds[values[LiquidityBotField.Volatility]]
        ?.trailingBounds || 0
    )
  )

  const trailingLowerBound = currentPrice.minus(
    currentPrice.times(
      volatilityStrategyBounds[values[LiquidityBotField.Volatility]]
        ?.trailingBounds || 0
    )
  )

  const baseAmountInUsd = selectedMarket.value
    ? new BigNumberInBase(values[LiquidityBotField.BaseAmount] || 0).times(
        tokenStore.tokenUsdPrice(selectedMarket.value.baseToken) || 0
      )
    : ZERO_IN_BASE

  const quoteAmountInUsd = selectedMarket.value
    ? new BigNumberInBase(values[LiquidityBotField.QuoteAmount] || 0).times(
        tokenStore.tokenUsdPrice(selectedMarket.value.quoteToken) || 0
      )
    : ZERO_IN_BASE

  const grids = calculateOrderLevels(
    baseAmountInUsd.plus(quoteAmountInUsd).toNumber(),
    150
  )

  return {
    grids,
    upperBound,
    lowerBound,
    currentPrice,
    trailingUpperBound,
    trailingLowerBound
  }
})

watch(
  selectedMarket,
  (market) => {
    status.setLoading()

    if (!market) {
      return
    }

    Promise.all([
      spotStore.fetchLastTrade({ marketId: market.marketId }),
      exchangeStore.fetchMarketHistory({
        marketIds: [market.marketId],
        countback: 7 * 24,
        resolution: MARKETS_HISTORY_CHART_ONE_HOUR
      })
    ])
      .then(([lastTrade]) => {
        lastTradedPrice.value = new BigNumberInWei(lastTrade.price).toBase(
          market.quoteToken.decimals - market.baseToken.decimals
        )
      })
      .finally(() => {
        status.setIdle()
      })
  },
  { immediate: true }
)
</script>

<template>
  <UContainer>
    <div class="flex flex-col gap-4 text-center items-center my-10">
      <h3 class="text-4xl lg:text-6xl font-bold">
        {{ $t('liquidityBots.title') }}
      </h3>
      <p class="text-sm lg:text-xl">
        {{ $t('liquidityBots.description') }}
      </p>
    </div>

    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-4 *:border *:p-4 *:rounded-lg my-10"
    >
      <div>
        <p class="text-xl font-bold">
          {{ $t('liquidityBots.setLiquidityBot') }}
        </p>
        <p class="text-sm font-semibold my-4">
          {{ $t('liquidityBots.selectPair') }}
        </p>

        <USelectMenu
          v-model="market"
          value-attribute="value"
          :options="marketOptions"
          searchable
          :search-attributes="['label', 'value']"
          size="xl"
        >
          <template #leading>
            <UAvatar
              v-if="selectedMarket"
              :src="selectedMarket.baseToken.logo"
              size="2xs"
              :alt="market"
            />
          </template>
        </USelectMenu>

        <PartialsLiquidityBotsSpotForm
          v-if="selectedMarket"
          v-bind="{
            market: selectedMarket,
            liquidityValues,
            status
          }"
          class="mt-4"
        />
      </div>

      <div>
        <PartialsLiquidityBotsSpotChart
          v-if="selectedMarket"
          v-bind="{ market: selectedMarket, liquidityValues, status }"
        />
      </div>
    </div>
  </UContainer>
</template>
