<template>
  <VPanel>
    <div
      v-if="pendingRewardsStartTimestamp > 0"
      class="text-right text-sm mb-4"
    >
      {{ $t('tradeAndEarn.campaignAsOf', { date: pendingRewardsCountdown }) }}
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
      <VItem class="col-span-2 lg:col-span-4">
        <template slot="value">
          <VEmpNumber
            :number="injMaxPendingCampaignRewards"
            :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          >
            <span>INJ</span>
          </VEmpNumber>

          <VEmpNumber
            sm
            class="text-gray-400"
            prefix="≈"
            :number="injMaxPendingCampaignRewardsInUsd"
            :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          >
            <span class="text-3xs">USD</span>
          </VEmpNumber>
        </template>
        <template slot="title">
          <div class="flex items-center justify-center">
            {{ $t('tradeAndEarn.pending_max_campaign_rewards') }}
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('tradeAndEarn.pending_max_campaign_rewards_tooltip')"
            />
          </div>
        </template>
      </VItem>
      <VItem class="col-span-2 lg:col-span-4">
        <template slot="value">
          <div
            v-if="isUserWalletConnected"
            class="flex flex-wrap justify-center"
          >
            <VEmpNumber :number="pendingTradeRewardPointsFactored">
              <span>{{ $t('pts') }}</span>
            </VEmpNumber>
            <span class="px-2">/</span>
            <VEmpNumber :number="totalPendingTradeRewardPointsFactored">
              <span>{{ $t('pts') }}</span>
            </VEmpNumber>
          </div>
          <span v-else>&mdash;</span>
        </template>
        <template slot="title">
          <div class="flex items-center justify-center">
            {{ $t('tradeAndEarn.myRewardPoints') }}
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('tradeAndEarn.myRewardPoints_tooltip')"
            />
          </div>
        </template>
      </VItem>
      <VItem class="col-span-2 lg:col-span-4">
        <template slot="value">
          <VEmpNumber
            v-if="isUserWalletConnected"
            :number="pendingEstimatedRewardsCapped"
            :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          >
            <span>INJ</span>
          </VEmpNumber>
          <span v-else>&mdash;</span>
          <VEmpNumber
            v-if="isUserWalletConnected"
            sm
            class="text-gray-400"
            prefix="≈"
            :number="pendingEstimatedRewardsCappedInUsd"
            :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          >
            <span class="text-3xs">USD</span>
          </VEmpNumber>
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
            class="text-primary-500 flex justify-center"
            target="_blank"
          >
            {{ $t('stake_more') }}
            <IconInfoTooltip
              class="ml-2"
              :tooltip="
                $t('tradeAndEarn.stake_total_to_receive_full_amount', {
                  total: pendingEstimatedRewards.toFormat(2)
                })
              "
            />
          </a>
        </template>
        <template slot="title">
          <div class="flex items-center justify-center">
            {{ $t('tradeAndEarn.est_rewards_stake') }}
            <IconInfoTooltip
              class="ml-2"
              :tooltip="
                $t('tradeAndEarn.est_rewards_stake_tooltip', {
                  maxRewards: DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS
                })
              "
            />
          </div>
        </template>
      </VItem>
    </div>
  </VPanel>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import Vue, { PropType } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  CampaignRewardPool,
  cosmosSdkDecToBigNumber,
  ExchangeParams,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS
} from '~/app/utils/constants'
import VItem from '~/components/partials/common/stats/item.vue'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'

export default Vue.extend({
  components: {
    VItem
  },

  props: {
    schedule: {
      type: Object as PropType<CampaignRewardPool>,
      required: true
    },

    index: {
      type: Number,
      required: true
    }
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

    exchangeParams(): ExchangeParams | undefined {
      return this.$accessor.exchange.params
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

    pendingTradeRewardsPoints(): string[] {
      return this.$accessor.exchange.pendingTradeRewardsPoints
    },

    injUsdPrice(): number {
      return this.$accessor.token.injUsdPrice
    },

    vestingDurationInSeconds(): number {
      const { exchangeParams } = this

      if (!exchangeParams) {
        return 0
      }

      if (!exchangeParams.tradingRewardsVestingDuration) {
        return 0
      }

      return new BigNumberInBase(
        exchangeParams.tradingRewardsVestingDuration || 0
      ).toNumber()
    },

    currentEpochStartTimestamp(): number {
      const { schedule } = this

      if (!schedule) {
        return 0
      }

      return new BigNumberInBase(schedule.startTimestamp).toNumber()
    },

    pendingRewardsStartTimestamp(): number {
      const { currentEpochStartTimestamp, vestingDurationInSeconds } = this

      if (currentEpochStartTimestamp === 0) {
        return 0
      }

      return new BigNumberInBase(currentEpochStartTimestamp)
        .minus(vestingDurationInSeconds)
        .toNumber()
    },

    pendingRewardsCountdown(): string {
      const { pendingRewardsStartTimestamp, vestingDurationInSeconds } = this

      return format(
        (pendingRewardsStartTimestamp + vestingDurationInSeconds) * 1000,
        'dd MMM HH:mm:ss'
      )
    },

    injMaxPendingCampaignRewards(): BigNumberInBase {
      const { schedule } = this

      if (!schedule) {
        return ZERO_IN_BASE
      }

      const [inj] = schedule.maxCampaignRewardsList

      return new BigNumberInBase(cosmosSdkDecToBigNumber(inj.amount || 0))
    },

    injMaxPendingCampaignRewardsInUsd(): BigNumberInBase {
      const { injMaxPendingCampaignRewards, injUsdPrice } = this

      return injMaxPendingCampaignRewards.multipliedBy(
        new BigNumberInBase(injUsdPrice)
      )
    },

    pendingTradeRewardPoints(): BigNumberInBase {
      const { pendingTradeRewardsPoints, index } = this

      if (pendingTradeRewardsPoints.length === 0) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        cosmosSdkDecToBigNumber(pendingTradeRewardsPoints[index] || 0)
      )
    },

    pendingTradeRewardPointsFactored(): BigNumberInBase {
      const { pendingTradeRewardPoints } = this

      return new BigNumberInWei(pendingTradeRewardPoints).toBase(
        6 /* Default factor for points, USDT decimals */
      )
    },

    totalPendingTradeRewardPoints(): BigNumberInBase {
      const { tradingRewardsCampaign, index } = this

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      const pointsList =
        tradingRewardsCampaign.pendingTotalTradeRewardPointsList

      if (pointsList.length === 0) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        cosmosSdkDecToBigNumber(pointsList[index] || 0)
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

      if (pendingTradeRewardPoints.lte(0)) {
        return ZERO_IN_BASE
      }

      return pendingTradeRewardPoints
        .dividedBy(totalPendingTradeRewardPoints)
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
