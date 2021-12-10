<template>
  <v-item>
    <div class="flex justify-between text-xs w-full mx-auto">
      <div class="flex-1 px-4 lg:px-6">
        <p class="text-gray-200 text-center font-semibold">
          {{ $t('derivatives') }}
        </p>
        <v-text-info
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
        </v-text-info>
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
import { UiDerivativeMarket } from '~/types'
import { PointsMultiplier, TradingRewardsCampaign } from '~/types/exchange'
import {
  derivatives as sortPerpetualMarkets
} from '~/routes.config'

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

    derivativeMarkets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    boostedMarkets(): {
      spot: PointsMultiplierWithMarketTicker[]
      derivatives: PointsMultiplierWithMarketTicker[]
    } {
      const { tradingRewardsCampaign, derivativeMarkets } = this

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

      const disqualifiedMarketIds =
        tradingRewardsCampaign.tradingRewardCampaignInfo
          .disqualifiedMarketIdsList
      const derivativeMarketIds =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
          .boostedDerivativeMarketIdsList
      const derivativeMarketsBoosts =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo
          .derivativeMarketMultipliersList

      const derivativeMarketsTickerBasedOnIds = derivativeMarkets
        .filter((derivativeMarket) =>
          derivativeMarketIds.includes(derivativeMarket.marketId)
        )
        .sort(
          (a, b) =>
            derivativeMarketIds.indexOf(a.marketId) -
            derivativeMarketIds.indexOf(b.marketId)
        )
        .map((m) => ({ ticker: m.ticker, slug: m.slug }))

      const derivatives = derivativeMarketsTickerBasedOnIds.reduce(
        (records, market, index) => {
          return [
            ...records,
            {
              ...market,
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

      const derivativesWithBoostInfo = [
        ...derivatives,
        ...nonBoostedDerivatives
      ].sort(function (a, b) {
        return (
          sortPerpetualMarkets.indexOf(a.slug) -
          sortPerpetualMarkets.indexOf(b.slug)
        )
      })

      return {
        spot: [],
        derivatives: derivativesWithBoostInfo
      } as {
        spot: PointsMultiplierWithMarketTicker[]
        derivatives: PointsMultiplierWithMarketTicker[]
      }
    }
  }
})
</script>
