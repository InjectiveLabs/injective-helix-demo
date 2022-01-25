<template>
  <v-panel :title="$t('tradeAndEarn.previousEpoch')">
    <div v-if="previousEpochStartTimestamp > 0" slot="title-context">
      {{ $t('tradeAndEarn.campaignEndedAt', { date: previousEpochCountdown }) }}
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
      <v-item class="col-span-2 lg:col-span-4">
        <template slot="value">
          <v-emp-number
            :number="injMaxPendingCampaignRewards"
            :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          >
            <span>INJ</span>
          </v-emp-number>

          <v-emp-number
            sm
            class="text-gray-400"
            prefix="≈"
            :number="injMaxPendingCampaignRewardsInUsd"
            :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          >
            <span class="text-3xs">USD</span>
          </v-emp-number>
        </template>
        <template slot="title">
          <div class="flex items-center justify-center">
            {{ $t('tradeAndEarn.pending_max_campaign_rewards') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('pending_max_campaign_rewards_tooltip')"
            />
          </div>
        </template>
      </v-item>
      <v-item class="col-span-2 lg:col-span-4">
        <template slot="value">
          <div
            v-if="isUserWalletConnected"
            class="flex flex-wrap justify-center"
          >
            <v-emp-number :number="pendingTradeRewardPointsFactored">
              <span>{{ $t('pts') }}</span>
            </v-emp-number>
            <span class="px-2">/</span>
            <v-emp-number :number="totalPendingTradeRewardPointsFactored">
              <span>{{ $t('pts') }}</span>
            </v-emp-number>
          </div>
          <span v-else>&mdash;</span>
        </template>
        <template slot="title">
          <div class="flex items-center justify-center">
            {{ $t('tradeAndEarn.myRewardPoints') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('tradeAndEarn.myRewardPoints_tooltip')"
            />
          </div>
        </template>
      </v-item>
      <v-item class="col-span-2 lg:col-span-4">
        <template slot="value">
          <v-emp-number
            v-if="isUserWalletConnected"
            :number="pendingEstimatedRewardsCapped"
            :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          >
            <span>INJ</span>
          </v-emp-number>
          <span v-else>&mdash;</span>
        </template>
        <template
          v-if="
            pendingEstimatedRewards.gt(0) &&
            pendingEstimatedRewardsCapped.lte(pendingEstimatedRewards)
          "
          slot="context"
        >
          <a
            v-if="isUserWalletConnected"
            :href="hubUrl"
            class="text-primary-500"
            target="_blank"
          >
            {{ $t('stake_more') }}
          </a>
          <p class="text-2xs text-gray-500 mt-1">
            {{
              $t('tradeAndEarn.stake_total_to_receive_full_amount', {
                total: pendingEstimatedRewards.toNumber()
              })
            }}
          </p>
        </template>
        <template slot="title">
          <div class="flex items-center justify-center">
            {{ $t('tradeAndEarn.est_rewards_stake') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="
                $t('tradeAndEarn.est_rewards_stake_tooltip', {
                  maxRewards: DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS
                })
              "
            />
          </div>
        </template>
      </v-item>
    </div>
  </v-panel>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import Vue from 'vue'
import { cosmosSdkDecToBigNumber } from '~/app/transformers'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import VItem from '~/components/partials/common/stats/item.vue'
import {
  FeeDiscountAccountInfo,
  TradingRewardsCampaign
} from '~/types/exchange'

export default Vue.extend({
  components: {
    VItem
  },

  data() {
    return {
      DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS,
      UI_DEFAULT_MIN_DISPLAY_DECIMALS,
      now: Math.floor(Date.now() / 1000)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    stakedAmount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ZERO_IN_BASE
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        cosmosSdkDecToBigNumber(feeDiscountAccountInfo.accountInfo.stakedAmount)
      )
    },

    tradeRewardsPoints(): string[] {
      return this.$accessor.exchange.tradeRewardsPoints
    },

    pendingTradeRewardsPoints(): string[] {
      return this.$accessor.exchange.pendingTradeRewardsPoints
    },

    injUsdPrice(): number {
      return this.$accessor.token.injUsdtPrice
    },

    campaignDurationInSeconds(): number {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return 0
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
        return 0
      }

      return new BigNumberInBase(
        tradingRewardsCampaign.tradingRewardCampaignInfo
          .campaignDurationSeconds || 0
      ).toNumber()
    },

    currentEpochStartTimestamp(): number {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return 0
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
        return 0
      }

      const [
        schedule
      ] = tradingRewardsCampaign.tradingRewardPoolCampaignScheduleList

      if (!schedule) {
        return 0
      }

      return new BigNumberInBase(schedule.startTimestamp).toNumber()
    },

    previousEpochStartTimestamp(): number {
      const { currentEpochStartTimestamp, campaignDurationInSeconds } = this

      if (currentEpochStartTimestamp === 0) {
        return 0
      }

      return new BigNumberInBase(currentEpochStartTimestamp)
        .minus(campaignDurationInSeconds)
        .toNumber()
    },

    previousEpochCountdown(): string {
      const { previousEpochStartTimestamp, campaignDurationInSeconds } = this

      return format(
        (previousEpochStartTimestamp + campaignDurationInSeconds) * 1000,
        'dd MMM HH:mm:ss'
      )
    },

    injMaxPendingCampaignRewards(): BigNumberInBase {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      const [
        schedule
      ] = tradingRewardsCampaign.pendingTradingRewardPoolCampaignScheduleList

      if (!schedule) {
        return ZERO_IN_BASE
      }

      const [inj] = schedule.maxCampaignRewardsList

      if (!inj) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(cosmosSdkDecToBigNumber(inj.amount || 0))
    },

    injMaxPendingCampaignRewardsInUsd(): BigNumberInBase {
      const { injMaxPendingCampaignRewards, injUsdPrice } = this

      return injMaxPendingCampaignRewards.multipliedBy(
        new BigNumberInBase(injUsdPrice)
      )
    },

    pendingTradeRewardPoints(): BigNumberInBase {
      const { pendingTradeRewardsPoints } = this

      if (!pendingTradeRewardsPoints.length) {
        return ZERO_IN_BASE
      }

      const [points] = pendingTradeRewardsPoints

      if (!points) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(cosmosSdkDecToBigNumber(points))
    },

    pendingTradeRewardPointsFactored(): BigNumberInBase {
      const { pendingTradeRewardPoints } = this

      return new BigNumberInWei(pendingTradeRewardPoints).toBase(
        6 /* Default factor for points, USDT decimals */
      )
    },

    totalPendingTradeRewardPoints(): BigNumberInBase {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        cosmosSdkDecToBigNumber(
          tradingRewardsCampaign.pendingTotalTradeRewardPoints || 0
        )
      )
    },

    totalPendingTradeRewardPointsFactored(): BigNumberInBase {
      const { totalPendingTradeRewardPoints } = this

      return new BigNumberInWei(totalPendingTradeRewardPoints).toBase(
        6 /* Default factor for points, USDT decimals */
      )
    },

    pendingEstimatedRewards(): BigNumberInBase {
      const {
        pendingTradeRewardPoints,
        totalPendingTradeRewardPoints,
        injMaxPendingCampaignRewards
      } = this

      if (totalPendingTradeRewardPoints.lte(0)) {
        return ZERO_IN_BASE
      }

      return totalPendingTradeRewardPoints
        .dividedBy(pendingTradeRewardPoints)
        .times(injMaxPendingCampaignRewards)
    },

    pendingEstimatedRewardsCapped(): BigNumberInBase {
      const { pendingEstimatedRewards, stakedAmount } = this

      if (pendingEstimatedRewards.lte(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)) {
        return pendingEstimatedRewards
      }

      if (stakedAmount.lte(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)) {
        return new BigNumberInBase(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)
      }

      return pendingEstimatedRewards.gte(stakedAmount)
        ? stakedAmount
        : pendingEstimatedRewards
    },

    pendingEstimatedRewardsCappedInUsd(): BigNumberInBase {
      const { pendingEstimatedRewardsCapped, injUsdPrice } = this

      return pendingEstimatedRewardsCapped.multipliedBy(
        new BigNumberInBase(injUsdPrice)
      )
    },

    hubUrl(): string {
      return 'https://hub.injective.network/staking'
    }
  }
})
</script>
