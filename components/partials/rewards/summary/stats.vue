<template>
  <div class="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-6">
    <v-item class="col-span-2 sm:col-span-6 lg:col-span-12" horizontal>
      <template slot="value">
        <span
          v-if="isUserWalletConnected && feePaidAmount.gt(0)"
          class="font-mono text-lg"
        >
          {{ feePaidAmountToFormat }}
          <span class="text-xs text-gray-400">USDT/USDC</span>
        </span>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title-horizontal">
        <div class="flex items-center justify-start">
          {{ $t('trading_fee_to_date') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trading_fee_to_date_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 sm:col-span-6 lg:col-span-12" horizontal>
      <template slot="value">
        <span v-if="currentEpochStartTimestamp > 0" class="text-lg">
          {{ epochStartDate }} - {{ epochEndDate }}
        </span>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title-horizontal">
        <div class="flex items-center justify-start">
          {{ $t('current_epoch') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('current_epoch_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 sm:col-span-6 lg:col-span-12" horizontal>
      <template slot="value">
        <span
          v-if="isUserWalletConnected && estimatedRewards.gt(0)"
          class="font-mono text-lg"
        >
          {{ estimatedRewardsToFormat }}
          <span class="text-xs text-gray-400">USDT/USDC</span>
        </span>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title-horizontal">
        <div class="flex items-center justify-start">
          {{ $t('est_rewards') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('est_rewards_tooltip')"
          />
        </div>
      </template>
    </v-item>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue from 'vue'
import { format } from 'date-fns'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
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
      now: new Date().getTime()
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

    tradeRewardsPoints(): string[] {
      return this.$accessor.exchange.tradeRewardsPoints
    },

    feePaidAmount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ZERO_IN_BASE
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.feePaidAmount
      ).toBase(6 /* USDT */)
    },

    feePaidAmountToFormat(): string {
      const { feePaidAmount } = this

      return feePaidAmount.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    tradeRewardPoints(): BigNumberInBase {
      const { tradeRewardsPoints } = this

      if (!tradeRewardsPoints.length) {
        return ZERO_IN_BASE
      }

      const [points] = tradeRewardsPoints

      return new BigNumberInWei(points).toBase()
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

    epochStartDate(): string {
      const { currentEpochStartTimestamp } = this

      return format(currentEpochStartTimestamp, 'dd MMM')
    },

    epochEndDate(): string {
      const { currentEpochStartTimestamp, now } = this

      return format(currentEpochStartTimestamp + now, 'dd MMM')
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

      if (injMaxCampaignRewards.lte(0)) {
        return ZERO_IN_BASE
      }

      return tradeRewardPoints
        .dividedBy(totalTradeRewardPoints)
        .times(injMaxCampaignRewards)
    },

    estimatedRewardsToFormat(): string {
      const { estimatedRewards } = this

      return estimatedRewards.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
