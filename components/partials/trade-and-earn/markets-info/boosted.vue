<template>
  <v-item>
    <div class="flex justify-between text-xs w-full mx-auto">
      <div class="flex-1 px-4 lg:px-6">
        <p class="text-gray-200 text-center font-semibold">
          {{ $t('trade.derivatives') }}
        </p>
        <TextInfo
          v-for="derivative in boostedMarkets.derivatives"
          :key="`derivative-${derivative.ticker}`"
          :title="derivative.ticker"
          class="mt-2"
        >
          <p class="text-gray-300 font-mono">
            <span>
              {{ derivative.makerPointsMultiplier }}x
              <span class="text-2xs text-gray-400 font-sans">
                {{ $t('maker_points_mul') }}
              </span>
              /
              {{ derivative.takerPointsMultiplier }}x
              <span class="text-2xs text-gray-400 font-sans">
                {{ $t('taker_points_mul') }}
              </span>
            </span>
          </p>
        </TextInfo>
      </div>

      <div class="flex-1 px-4 lg:px-12">
        <p class="text-gray-200 text-center font-semibold">
          {{ $t('trade.spot') }}
        </p>
        <TextInfo
          v-for="spot in boostedMarkets.spot"
          :key="`spot-${spot.ticker}`"
          :title="spot.ticker"
          class="mt-2"
        >
          <p class="text-gray-300 font-mono">
            <span>
              {{ spot.makerPointsMultiplier }}x
              <span class="text-2xs text-gray-400 font-sans">
                {{ $t('maker_points_mul') }}
              </span>
              /
              {{ spot.takerPointsMultiplier }}x
              <span class="text-2xs text-gray-400 font-sans">
                {{ $t('taker_points_mul') }}
              </span>
            </span>
          </p>
        </TextInfo>
      </div>
    </div>
    <template slot="title">
      <div class="flex items-center justify-center">
        {{ $t('trade.boosted_markets') }}
        <IconInfoTooltip
          class="ml-2"
          :tooltip="$t('trade.boosted_markets_tooltip')"
        />
      </div>
    </template>
  </v-item>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
  PointsMultiplier
} from '@injectivelabs/sdk-ts'
import VItem from '~/components/partials/common/stats/item.vue'
import {
  derivatives as sortPerpetualMarkets,
  spot as sortSpotMarkets
} from '~/routes.config'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'
interface PointsMultiplierWithMarketTicker extends PointsMultiplier {
  ticker: string
  slug: string
}

export default Vue.extend({
  components: {
    VItem
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    boostedMarkets(): {
      spot: PointsMultiplierWithMarketTicker[]
      derivatives: PointsMultiplierWithMarketTicker[]
    } {
      const { tradingRewardsCampaign, spotMarkets, derivativeMarkets } = this

      if (!tradingRewardsCampaign) {
        return { spot: [], derivatives: [] }
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
        return { spot: [], derivatives: [] }
      }

      if (
        !tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
      ) {
        return { spot: [], derivatives: [] }
      }

      const spotMarketIds =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
          .boostedSpotMarketIdsList
      const disqualifiedMarketIds =
        tradingRewardsCampaign.tradingRewardCampaignInfo
          .disqualifiedMarketIdsList
      const spotMarketsBoosts =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
          .spotMarketMultipliersList
      const derivativeMarketIds =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
          .boostedDerivativeMarketIdsList
      const derivativeMarketsBoosts =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
          .derivativeMarketMultipliersList

      const spotMarketsTickerBasedOnIds = spotMarkets
        .filter((spotMarket) => spotMarketIds.includes(spotMarket.marketId))
        .filter((spot) => sortSpotMarkets.includes(spot.slug))
        .sort(
          (a, b) =>
            spotMarketIds.indexOf(a.marketId) -
            spotMarketIds.indexOf(b.marketId)
        )
        .map((m) => ({
          ticker: m.ticker,
          slug: m.slug,
          index: spotMarketIds.indexOf(m.marketId)
        }))

      const derivativeMarketsTickerBasedOnIds = derivativeMarkets
        .filter((derivativeMarket) =>
          derivativeMarketIds.includes(derivativeMarket.marketId)
        )
        .filter((derivativeMarket) =>
          sortPerpetualMarkets.includes(derivativeMarket.slug)
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
      const nonBoostedSpot = [...spotMarkets]
        .filter(
          (spotMarket) =>
            !spotMarketIds.includes(spotMarket.marketId) &&
            !disqualifiedMarketIds.includes(spotMarket.marketId)
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

      const nonBoostedDerivatives = [...derivativeMarkets]
        .filter(
          (derivative) =>
            !derivativeMarketIds.includes(derivative.marketId) &&
            !disqualifiedMarketIds.includes(derivative.marketId)
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

      const spotWithBoostInfo = [...spot, ...nonBoostedSpot].sort((a, b) => {
        return sortSpotMarkets.indexOf(a.slug) - sortSpotMarkets.indexOf(b.slug)
      })
      const derivativesWithBoostInfo = [
        ...derivatives,
        ...nonBoostedDerivatives
      ].sort((a, b) => {
        return (
          sortPerpetualMarkets.indexOf(a.slug) -
          sortPerpetualMarkets.indexOf(b.slug)
        )
      })

      return {
        spot: spotWithBoostInfo,
        derivatives: derivativesWithBoostInfo
      } as {
        spot: PointsMultiplierWithMarketTicker[]
        derivatives: PointsMultiplierWithMarketTicker[]
      }
    }
  }
})
</script>
