<template>
  <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <span v-if="isUserWalletConnected" class="font-mono text-lg">
          {{ tradeRewardPointsToFormat }}
          <span class="text-sm text-gray-400">%</span>
        </span>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('reward_points') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('reward_points_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <span v-if="isUserWalletConnected" class="font-mono text-lg">
          {{ claimableRewardsToFormat }}
          <span class="text-xs text-gray-400">INJ</span>
        </span>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('claimable_inj') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('claimable_inj_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <span v-if="currentEpochStartTimestamp > 0" class="font-mono text-lg">
          {{ epochCountdown }}
        </span>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('countdown_campaign') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('countdown_campaign_tooltip')"
          />
        </div>
      </template>
    </v-item>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { formatDistanceStrict } from 'date-fns'
import Vue from 'vue'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import VItem from '~/components/partials/common/stats/item.vue'
import { TradingRewardsCampaign } from '~/types/exchange'

export default Vue.extend({
  components: {
    VItem
  },

  data() {
    return {
      now: Math.floor(Date.now() / 1000)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    tradeRewardsPoints(): string[] {
      return this.$accessor.exchange.tradeRewardsPoints
    },

    tradeRewardPoints(): BigNumberInBase {
      const { tradeRewardsPoints } = this

      if (!tradeRewardsPoints.length) {
        return ZERO_IN_BASE
      }

      const [points] = tradeRewardsPoints

      return new BigNumberInWei(points).toBase()
    },

    tradeRewardPointsToFormat(): string {
      const { tradeRewardPoints } = this

      return tradeRewardPoints.times(100).toFormat(2)
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

    epochPassPercentage(): BigNumberInBase {
      const {
        now,
        currentEpochStartTimestamp,
        campaignDurationInSeconds
      } = this

      const end = new BigNumberInBase(currentEpochStartTimestamp).plus(
        campaignDurationInSeconds
      )

      return end.dividedBy(now).times(100)
    },

    epochCountdown(): string {
      const { currentEpochStartTimestamp, now } = this

      return formatDistanceStrict(currentEpochStartTimestamp, now, {
        addSuffix: true
      })
    },

    epochPassPercentageToFormat(): string {
      const { epochPassPercentage } = this

      return epochPassPercentage.toFormat(2)
    },

    injMaxCampaignRewards(): BigNumberInBase {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      const [
        schedule
      ] = tradingRewardsCampaign.tradingRewardPoolCampaignScheduleList

      if (!schedule) {
        return ZERO_IN_BASE
      }

      const [inj] = schedule.maxCampaignRewardsList

      if (!inj) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(inj.amount || 0).toBase()
    },

    totalTradeRewardPoints(): BigNumberInBase {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(
        tradingRewardsCampaign.totalTradeRewardPoints || 0
      ).toBase()
    },

    estimatedRewards(): BigNumberInBase {
      const {
        tradeRewardPoints,
        totalTradeRewardPoints,
        injMaxCampaignRewards
      } = this

      if (totalTradeRewardPoints.lte(0)) {
        return ZERO_IN_BASE
      }

      return tradeRewardPoints
        .dividedBy(totalTradeRewardPoints)
        .times(injMaxCampaignRewards)
    },

    estimatedRewardsToFormat(): string {
      const { estimatedRewards } = this

      return estimatedRewards.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    claimableRewards(): BigNumberInBase {
      const { estimatedRewards, epochPassPercentage } = this

      return estimatedRewards.times(epochPassPercentage).dividedBy(100)
    },

    claimableRewardsToFormat(): string {
      const { claimableRewards } = this

      return claimableRewards.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
