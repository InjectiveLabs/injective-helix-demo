<template>
  <v-item>
    <div class="flex justify-between text-xs w-full mx-auto lg:w-3/4">
      <div class="flex-1 px-4 lg:px-6">
        <p class="text-gray-400 text-center uppercase font-semibold">
          {{ $t('derivatives') }}
        </p>
        <div
          v-for="derivative in boostedMarkets.derivatives"
          :key="`derivative-${derivative.ticker}`"
          class="flex items-center justify-between text-xs mt-2"
        >
          <p class="text-gray-200 font-semibold">{{ derivative.ticker }}</p>
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
        </div>
      </div>
      <div class="flex-1 px-4 lg:px-12">
        <p class="text-gray-400 text-center uppercase font-semibold">
          {{ $t('spot') }}
        </p>
        <div
          v-for="spot in boostedMarkets.spot"
          :key="`spot-${spot.ticker}`"
          class="flex items-center justify-between text-xs mt-2"
        >
          <p class="text-gray-200 font-semibold">{{ spot.ticker }}</p>
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
        </div>
      </div>
    </div>
    <template slot="title">
      <div class="flex items-center justify-center">
        {{ $t('boosted_markets') }}
        <v-icon-info-tooltip
          class="ml-2"
          :tooltip="$t('boosted_markets_tooltip')"
        />
      </div>
    </template>
  </v-item>
</template>

<script lang="ts">
import Vue from 'vue'
import { cosmosSdkDecToBigNumber } from '~/app/transformers'
import VItem from '~/components/partials/common/stats/item.vue'
import { UiDerivativeMarket, UiSpotMarket } from '~/types'
import { PointsMultiplier, TradingRewardsCampaign } from '~/types/exchange'

interface PointsMultiplierWithMarketTicker extends PointsMultiplier {
  ticker: string
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

    spotMarkets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    derivativeMarkets(): UiDerivativeMarket[] {
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
        .map((m) => m.ticker)

      const derivativeMarketsTickerBasedOnIds = derivativeMarkets
        .filter((derivativeMarket) =>
          derivativeMarketIds.includes(derivativeMarket.marketId)
        )
        .map((m) => m.ticker)

      const spot = spotMarketsTickerBasedOnIds.reduce(
        (records, ticker, index) => {
          return [
            ...records,
            {
              ticker,
              makerPointsMultiplier: cosmosSdkDecToBigNumber(
                spotMarketsBoosts[index].makerPointsMultiplier
              ).toFixed(),
              takerPointsMultiplier: cosmosSdkDecToBigNumber(
                spotMarketsBoosts[index].takerPointsMultiplier
              ).toFixed()
            } as PointsMultiplierWithMarketTicker
          ]
        },
        [] as PointsMultiplierWithMarketTicker[]
      )

      const derivatives = derivativeMarketsTickerBasedOnIds.reduce(
        (records, ticker, index) => {
          return [
            ...records,
            {
              ticker,
              makerPointsMultiplier: cosmosSdkDecToBigNumber(
                derivativeMarketsBoosts[index].makerPointsMultiplier
              ).toFixed(),
              takerPointsMultiplier: cosmosSdkDecToBigNumber(
                derivativeMarketsBoosts[index].takerPointsMultiplier
              ).toFixed()
            } as PointsMultiplierWithMarketTicker
          ]
        },
        [] as PointsMultiplierWithMarketTicker[]
      )

      return { spot, derivatives } as {
        spot: PointsMultiplierWithMarketTicker[]
        derivatives: PointsMultiplierWithMarketTicker[]
      }
    }
  }
})
</script>
