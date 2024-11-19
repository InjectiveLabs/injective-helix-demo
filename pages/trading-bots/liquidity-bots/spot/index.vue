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
import {
  GST_DEFAULT_PRICE_TICK_SIZE,
  GST_MAXIMUM_GRIDS,
  MARKETS_HISTORY_CHART_ONE_HOUR,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { LiquidityBotField, LiquidityBotForm } from '@/types'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()
const campaignStore = useCampaignStore()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()

const { values, resetForm } = useForm<LiquidityBotForm>()

const status = reactive(new Status(StatusType.Loading))
const gridStrategyStatus = reactive(new Status(StatusType.Loading))

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
      marketReward: marketRewards.value[market.marketId],
      avatar: {
        src: market.baseToken.logo
      },
      active: gridStrategyStore.activeStrategies.some(
        (strategy) => strategy.marketId === market.marketId
      )
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

const marketRewards = computed(() =>
  campaignStore.latestRoundCampaigns.reduce(
    (acc, campaign) => {
      const market = spotStore.markets.find(
        ({ marketId }) => marketId === campaign.marketId
      )

      const reward = campaign.rewards[0]

      const token = tokenStore.verifiedTokens.find(
        ({ denom }) => denom === reward?.denom
      )

      if (!market || !reward || !token) {
        return acc
      }

      const amount = sharedToBalanceInToken({
        value: reward.amount,
        decimalPlaces: token.decimals
      })

      acc[market.marketId] = {
        symbol: token.symbol,
        amount
      }

      return acc
    },
    {} as Record<string, { symbol: string; amount: string }>
  )
)

const marketReward = computed(() => {
  return selectedMarket.value &&
    marketRewards.value[selectedMarket.value.marketId]
    ? marketRewards.value[selectedMarket.value.marketId]
    : undefined
})

const tickSize = computed(() =>
  selectedMarket.value
    ? sharedToBalanceInToken({
        value: selectedMarket.value.minPriceTickSize,
        decimalPlaces:
          selectedMarket.value.quoteToken.decimals -
          selectedMarket.value.baseToken.decimals
      })
    : GST_DEFAULT_PRICE_TICK_SIZE
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

  const range = new BigNumberInBase(upperBound).minus(lowerBound)

  const maximumGrids = range.dividedBy(Number(tickSize.value)).toFixed(0)

  const grids = calculateOrderLevels(
    baseAmountInUsd.plus(quoteAmountInUsd).toNumber(),
    Math.min(Number(maximumGrids), GST_MAXIMUM_GRIDS)
  )

  return {
    grids,
    upperBound: new BigNumberInBase(
      upperBound.toFixed(
        selectedMarket.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )
    ),
    lowerBound: new BigNumberInBase(
      lowerBound.toFixed(
        selectedMarket.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )
    ),
    currentPrice: new BigNumberInBase(
      currentPrice.toFixed(
        selectedMarket.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )
    ),
    trailingUpperBound: new BigNumberInBase(
      trailingUpperBound.toFixed(
        selectedMarket.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )
    ),
    trailingLowerBound: new BigNumberInBase(
      trailingLowerBound.toFixed(
        selectedMarket.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )
    )
  }
})

watch(
  selectedMarket,
  (market) => {
    status.setLoading()
    resetForm()

    if (!market) {
      return
    }

    const subaccountId = addressAndMarketSlugToSubaccountId(
      sharedWalletStore.address,
      market.slug
    )

    Promise.all([
      spotStore.fetchLastTrade({ marketId: market.marketId }),
      spotStore.fetchOrdersBySubaccount({
        subaccountId,
        marketIds: [market.marketId]
      }),
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

onWalletConnected(() => {
  gridStrategyStatus.setLoading()

  gridStrategyStore.fetchAllStrategies({ active: true }).finally(() => {
    gridStrategyStatus.setIdle()
  })
})

onMounted(() => {
  campaignStore.fetchRound()
})

const activeStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) => strategy.marketId === selectedMarket.value?.marketId
  )
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
          clear-search-on-close
          :search-attributes="['label', 'value']"
          size="xl"
          :ui-menu="{
            option: {
              base: 'w-full *:flex-1'
            }
          }"
        >
          <template #leading>
            <UAvatar
              v-if="selectedMarket"
              :src="selectedMarket.baseToken.logo"
              size="2xs"
              :alt="market"
              class="mr-2"
            />
          </template>

          <template #label="{ selected }">
            <template v-if="selected">
              <span>{{ selected.label }}</span>
              <span
                v-if="selected.active"
                class="size-2 bg-green-500 rounded-full"
              />
            </template>
          </template>

          <template #trailing>
            <span
              v-if="marketReward"
              :class="`from-blue-500 to-blue-200 bg-gradient-to-r bg-clip-text text-xs font-semibold text-transparent px-2 py-1 rounded-md`"
            >
              {{
                $t('liquidityBots.upToRewards', {
                  amount: marketReward.amount,
                  symbol: marketReward.symbol
                })
              }}
            </span>
          </template>

          <template #option="{ option }">
            <UAvatar :src="option.avatar.src" size="2xs" />
            <span>{{ option.label }}</span>
            <span
              v-if="option.active"
              class="size-2 bg-green-500 rounded-full"
            />

            <span
              v-if="option.marketReward"
              class="from-blue-500 to-blue-200 bg-gradient-to-r bg-clip-text text-xs font-semibold text-transparent px-2 py-1 rounded-md ml-auto"
            >
              {{
                $t('liquidityBots.upToRewards', {
                  amount: option.marketReward.amount,
                  symbol: option.marketReward.symbol
                })
              }}
            </span>
          </template>
        </USelectMenu>

        <USkeleton
          v-if="gridStrategyStatus.isLoading()"
          class="w-full h-96 mt-4"
        />

        <PartialsLiquidityCommonActiveStrategyDetails
          v-else-if="activeStrategy && selectedMarket"
          class="mt-4"
          :active-strategy="activeStrategy"
        />

        <PartialsLiquidityBotsSpotForm
          v-else-if="selectedMarket"
          v-bind="{
            market: selectedMarket,
            liquidityValues,
            status,
            lastTradedPrice: new BigNumberInBase(lastTradedPrice)
          }"
          class="mt-4"
        />
      </div>

      <div>
        <PartialsLiquidityBotsSpotChart
          v-if="selectedMarket"
          v-bind="{
            status,
            market: selectedMarket,
            activeStrategy,
            liquidityValues,
            lastTradedPrice: new BigNumberInBase(lastTradedPrice),
            marketReward
          }"
        />
      </div>
    </div>
  </UContainer>
</template>
