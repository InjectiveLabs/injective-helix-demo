<template>
  <VPanel :title="$t('Current Epoch')">
    <div v-if="currentEpochStartTimestamp > 0" slot="title-context">
      {{ $t('tradeAndEarn.campaignEndingOn', { date: epochCountdown }) }}
    </div>
    <HocLoading :status="status">
      <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
        <VItem class="col-span-2 lg:col-span-4">
          <template slot="value">
            <VEmpNumber
              :number="injMaxCampaignRewards"
              :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            >
              <span>INJ</span>
            </VEmpNumber>

            <VEmpNumber
              sm
              class="text-gray-400"
              prefix="≈"
              :number="injMaxCampaignRewardsInUsd"
              :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            >
              <span class="text-3xs">USD</span>
            </VEmpNumber>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('max_campaign_rewards') }}
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('max_campaign_rewards_tooltip')"
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
              <VEmpNumber :number="tradeRewardPointsFactored">
                <span>{{ $t('pts') }}</span>
              </VEmpNumber>
              <span class="px-2">/</span>
              <VEmpNumber :number="totalTradeRewardPointsFactored">
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
              :number="estimatedRewards"
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
              :number="estimatedRewardsInUsd"
              :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            >
              <span class="text-3xs">USD</span>
            </VEmpNumber>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('est_rewards') }}
              <IconInfoTooltip
                class="ml-2"
                :tooltip="
                  $t('est_rewards_tooltip', {
                    maxRewards: DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS
                  })
                "
              />
            </div>
          </template>
        </VItem>
      </div>
    </HocLoading>
  </VPanel>
</template>

<script lang="ts">
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { format } from 'date-fns'
import Vue from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
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

  data() {
    return {
      status: new Status(StatusType.Loading),

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

    tradeRewardsPoints(): string[] {
      return this.$accessor.exchange.tradeRewardsPoints
    },

    injUsdPrice(): number {
      return this.$accessor.token.injUsdPrice
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

    tradeRewardPointsFactored(): BigNumberInBase {
      const { tradeRewardPoints } = this

      return new BigNumberInWei(tradeRewardPoints).toBase(
        6 /* Default factor for points, USDT decimals */
      )
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

      const [schedule] =
        tradingRewardsCampaign.tradingRewardPoolCampaignScheduleList

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

    injMaxCampaignRewards(): BigNumberInBase {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      const [schedule] =
        tradingRewardsCampaign.tradingRewardPoolCampaignScheduleList

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
        injMaxCampaignRewards,
        stakedAmount
      } = this

      if (totalTradeRewardPoints.lte(0)) {
        return ZERO_IN_BASE
      }

      const estRewards = tradeRewardPoints
        .dividedBy(totalTradeRewardPoints)
        .times(injMaxCampaignRewards)

      if (estRewards.lte(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)) {
        return estRewards
      }

      if (stakedAmount.lte(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)) {
        return new BigNumberInBase(DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS)
      }

      return estRewards.gte(stakedAmount) ? stakedAmount : estRewards
    },

    estimatedRewardsInUsd(): BigNumberInBase {
      const { estimatedRewards, injUsdPrice } = this

      return estimatedRewards.multipliedBy(new BigNumberInBase(injUsdPrice))
    }
  },

  mounted() {
    Promise.all([this.$accessor.exchange.fetchTradeRewardPoints()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  }
})
</script>
