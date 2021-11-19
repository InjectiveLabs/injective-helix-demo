<template>
  <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <v-emp-number v-if="isUserWalletConnected" :number="estimatedRewards">
          <span>INJ</span>
        </v-emp-number>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('est_rewards') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('est_rewards_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <v-emp-number
          v-if="isUserWalletConnected"
          :number="tradeRewardPointsFactored"
        >
          <span>{{ $t('pts') }}</span>
        </v-emp-number>
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
        <v-emp-number
          v-if="totalTradeRewardPoints.gte(0)"
          :number="totalTradeRewardPointsFactored"
        >
          <span>{{ $t('pts') }}</span>
        </v-emp-number>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('total_reward_points') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('total_reward_points_tooltip')"
          />
        </div>
      </template>
    </v-item>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue from 'vue'
import { cosmosSdkDecToBigNumber } from '~/app/transformers'
import { ZERO_IN_BASE } from '~/app/utils/constants'
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

      if (!points) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(cosmosSdkDecToBigNumber(points))
    },

    tradeRewardPointsFactored(): BigNumberInBase {
      const { tradeRewardPoints } = this

      return new BigNumberInWei(tradeRewardPoints).toBase(
        6 /* Default factor for points, USDT decimals */
      )
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

    totalTradeRewardPoints(): BigNumberInBase {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        cosmosSdkDecToBigNumber(
          tradingRewardsCampaign.totalTradeRewardPoints || 0
        )
      )
    },

    totalTradeRewardPointsFactored(): BigNumberInBase {
      const { totalTradeRewardPoints } = this

      return new BigNumberInWei(totalTradeRewardPoints).toBase(
        6 /* Default factor for points, USDT decimals */
      )
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
    }
  }
})
</script>
