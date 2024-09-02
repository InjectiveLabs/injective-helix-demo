<script lang="ts" setup>
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { spotSlugs, expirySlugs, derivativeSlugs } from '@/app/json'
import { PointsMultiplierWithMarketTicker } from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const exchangeStore = useExchangeStore()

const {
  spotBoostedMarketIdList,
  disqualifiedMarketIdsList,
  spotBoostedMultiplierList,
  derivativeBoostedMarketIdList,
  derivativeBoostedMultiplierList
} = useTradeReward()

const derivativeBoostedMarkets = computed(() => {
  const derivativeMarketIds = derivativeBoostedMarketIdList.value
  const derivativeMarketsBoosts = derivativeBoostedMultiplierList.value
  const disqualifiedMarketIds = disqualifiedMarketIdsList.value

  const derivativeMarketsTickerBasedOnIds = derivativeStore.markets
    .filter((derivativeMarket) =>
      derivativeMarketIds.includes(derivativeMarket.marketId)
    )
    .filter((derivativeMarket) =>
      [...expirySlugs, ...derivativeSlugs].includes(derivativeMarket.slug)
    )
    .sort(
      (a, b) =>
        derivativeMarketIds.indexOf(a.marketId) -
        derivativeMarketIds.indexOf(b.marketId)
    )
    .map((m) => ({
      ticker: m.ticker,
      slug: m.slug,
      index: derivativeMarketIds.indexOf(m.marketId)
    }))

  const derivatives = derivativeMarketsTickerBasedOnIds.reduce(
    (records, market) => {
      return [
        ...records,
        {
          ...market,
          makerPointsMultiplier: cosmosSdkDecToBigNumber(
            derivativeMarketsBoosts[market.index].makerPointsMultiplier
          ).toFixed(),
          takerPointsMultiplier: cosmosSdkDecToBigNumber(
            derivativeMarketsBoosts[market.index].takerPointsMultiplier
          ).toFixed()
        } as PointsMultiplierWithMarketTicker
      ]
    },
    [] as PointsMultiplierWithMarketTicker[]
  )

  const nonBoostedDerivatives = [...derivativeStore.markets]
    .filter(
      (derivative) =>
        !derivativeMarketIds.includes(derivative.marketId) &&
        !disqualifiedMarketIds.includes(derivative.marketId) &&
        exchangeStore.tradingRewardsCampaign?.tradingRewardCampaignInfo?.quoteDenomsList.includes(
          derivative.quoteDenom
        )
    )
    .map((m) => ({ ticker: m.ticker, slug: m.slug }))
    .reduce((records, market) => {
      return [
        ...records,
        {
          ...market,
          makerPointsMultiplier: '1',
          takerPointsMultiplier: '1'
        }
      ]
    }, [] as PointsMultiplierWithMarketTicker[])

  return [...derivatives, ...nonBoostedDerivatives].sort(
    (a, b) =>
      [...expirySlugs, ...derivativeSlugs].indexOf(a.slug) -
      [...expirySlugs, ...derivativeSlugs].indexOf(b.slug)
  )
})

const spotBoostedMarkets = computed(() => {
  const disqualifiedMarketIds = disqualifiedMarketIdsList.value
  const spotMarketIds = spotBoostedMarketIdList.value
  const spotMarketsBoosts = spotBoostedMultiplierList.value

  const spotMarketsTickerBasedOnIds = spotStore.markets
    .filter((spotMarket) => spotMarketIds.includes(spotMarket.marketId))
    .filter((spot) => spotSlugs.includes(spot.slug))
    .sort(
      (a, b) =>
        spotMarketIds.indexOf(a.marketId) - spotMarketIds.indexOf(b.marketId)
    )
    .map((m) => ({
      ticker: m.ticker,
      slug: m.slug,
      index: spotMarketIds.indexOf(m.marketId)
    }))

  const spot = spotMarketsTickerBasedOnIds.reduce((records, market) => {
    return [
      ...records,
      {
        ...market,
        makerPointsMultiplier: cosmosSdkDecToBigNumber(
          spotMarketsBoosts[market.index].makerPointsMultiplier
        ).toFixed(),
        takerPointsMultiplier: cosmosSdkDecToBigNumber(
          spotMarketsBoosts[market.index].takerPointsMultiplier
        ).toFixed()
      } as PointsMultiplierWithMarketTicker
    ]
  }, [] as PointsMultiplierWithMarketTicker[])

  const nonBoostedSpot = [...spotStore.markets]
    .filter(
      (spotMarket) =>
        !spotMarketIds.includes(spotMarket.marketId) &&
        !disqualifiedMarketIds.includes(spotMarket.marketId) &&
        exchangeStore.tradingRewardsCampaign?.tradingRewardCampaignInfo?.quoteDenomsList.includes(
          spotMarket.quoteDenom
        )
    )
    .map((m) => ({ ticker: m.ticker, slug: m.slug }))
    .reduce((records, market) => {
      return [
        ...records,
        {
          ...market,
          makerPointsMultiplier: '1',
          takerPointsMultiplier: '1'
        }
      ]
    }, [] as PointsMultiplierWithMarketTicker[])

  return [...spot, ...nonBoostedSpot].sort(
    (a, b) => spotSlugs.indexOf(a.slug) - spotSlugs.indexOf(b.slug)
  )
})
</script>

<template>
  <PartialsCommonStatsItem>
    <div class="flex justify-between text-xs w-full mx-auto">
      <div class="flex-1 px-4 lg:px-6">
        <p class="text-gray-200 text-center font-semibold">
          {{ $t('trade.derivatives') }}
        </p>
        <CommonTextInfo
          v-for="derivative in derivativeBoostedMarkets"
          :key="`derivative-${derivative.ticker}`"
          :title="derivative.ticker"
          class="mt-1 text-gray-550"
          is-sm
        >
          <p class="text-white font-mono">
            <span>
              {{ derivative.makerPointsMultiplier }}x
              <span class="text-sm text-gray-350 font-sans">
                {{ $t('tradeAndEarn.makerPoints') }}
              </span>
              /
              {{ derivative.takerPointsMultiplier }}x
              <span class="text-sm text-gray-350 font-sans">
                {{ $t('tradeAndEarn.takerPoints') }}
              </span>
            </span>
          </p>
        </CommonTextInfo>
      </div>

      <div class="flex-1 px-4 lg:px-12">
        <p class="text-gray-200 text-center font-semibold">
          {{ $t('trade.spot') }}
        </p>
        <CommonTextInfo
          v-for="spot in spotBoostedMarkets"
          :key="`spot-${spot.ticker}`"
          :title="spot.ticker"
          class="mt-1 text-gray-550"
          is-sm
        >
          <p class="text-white font-mono">
            <span>
              {{ spot.makerPointsMultiplier }}x
              <span class="text-sm text-gray-350 font-sans">
                {{ $t('tradeAndEarn.makerPoints') }}
              </span>
              /
              {{ spot.takerPointsMultiplier }}x
              <span class="text-sm text-gray-350 font-sans">
                {{ $t('tradeAndEarn.takerPoints') }}
              </span>
            </span>
          </p>
        </CommonTextInfo>
      </div>
    </div>

    <template #title>
      <div class="flex items-center justify-center text-gray-450 text-xs">
        {{ $t('trade.boosted_markets') }}
        <AppTooltip
          class="ml-2 text-gray-450"
          :content="$t('trade.boosted_markets_tooltip')"
        />
      </div>
    </template>
  </PartialsCommonStatsItem>
</template>
