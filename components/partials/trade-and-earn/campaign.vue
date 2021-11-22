<template>
  <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <v-emp-number
          :number="injMaxCampaignRewards"
          :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
        >
          <span>INJ</span>
        </v-emp-number>

        <v-emp-number
          sm
          class="text-gray-400"
          prefix="≈"
          :number="injMaxCampaignRewardsInUsd"
          :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
        >
          <span class="text-3xs">USD</span>
        </v-emp-number>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('max_campaign_rewards') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('max_campaign_rewards_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <span class="font-mono text-lg">
          {{ campaignDurationToString }}
        </span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('campaign_duration') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('campaign_duration_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <div v-if="currentEpochStartTimestamp > 0">
          <span class="block font-mono text-lg">
            {{ epochCountdown }}
          </span>
          <span class="block text-xs text-gray-400">
            {{ epochCountdownDistance }} {{ $t('remaining') }}
          </span>
        </div>
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
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  formatDuration,
  formatDistanceToNowStrict,
  format,
  intervalToDuration
} from 'date-fns'
import Vue from 'vue'
import { cosmosSdkDecToBigNumber } from '~/app/transformers'
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
      UI_DEFAULT_MIN_DISPLAY_DECIMALS,
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

    epochCountdown(): string {
      const { currentEpochStartTimestamp, campaignDurationInSeconds } = this

      return format(
        (currentEpochStartTimestamp + campaignDurationInSeconds) * 1000,
        'dd MMM HH:mm:ss'
      )
    },

    epochCountdownDistance(): string {
      const { currentEpochStartTimestamp, campaignDurationInSeconds } = this

      return formatDistanceToNowStrict(
        (currentEpochStartTimestamp + campaignDurationInSeconds) * 1000
      )
    },

    campaignDurationToString(): string {
      const { campaignDurationInSeconds } = this

      const duration = intervalToDuration({
        start: Date.now() + campaignDurationInSeconds * 1000,
        end: Date.now()
      })

      return formatDuration(duration, {
        delimiter: ' '
      })
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

      return new BigNumberInBase(cosmosSdkDecToBigNumber(inj.amount || 0))
    },

    injMaxCampaignRewardsInUsd(): BigNumberInBase {
      const { injMaxCampaignRewards, injUsdPrice } = this

      return injMaxCampaignRewards.multipliedBy(
        new BigNumberInBase(injUsdPrice)
      )
    }
  }
})
</script>
