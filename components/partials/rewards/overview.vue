<template>
  <v-card>
    <div v-if="isUserWalletConnected">
      <div>
        <div class="p-2 w-full text-center">
          <p class="text-xs uppercase text-gray-400">
            <span class="flex w-full justify-center">
              {{ $t('Estimated Rewards') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('Estimated Rewards Tooltip')"
              />
            </span>
          </p>
          <h2 class="mt-4 text-lg lg:text-2xl font-mono text-gray-100">
            <span v-if="feeDiscountAccountInfo && tradingRewardsCampaign">
              &#8776; {{ estimatedRewards }} INJ
            </span>
            <span v-else>&mdash;</span>
          </h2>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 mt-4">
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value">
            <span v-if="feeDiscountAccountInfo" class="font-mono">{{
              tierLevel
            }}</span>
            <span v-else class="text-xs text-gray-400 font-mono"></span>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('My Tier') }}
              <v-icon-info-tooltip class="ml-2" :tooltip="$t('Tier Tooltip')" />
            </div>
          </template>
        </v-item>
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value">
            <span v-if="feeDiscountAccountInfo" class="font-mono text-lg">
              {{ stakedAmount }}
              <span class="text-xs text-gray-400">INJ</span>
            </span>
            <span v-else>&mdash;</span>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('Staked Amount') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('Staked Amount Tooltip')"
              />
            </div>
          </template>
        </v-item>
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value">
            <span v-if="feeDiscountAccountInfo" class="font-mono text-lg">
              {{ feeAmount }}
              <span class="text-xs text-gray-400">USDT/USDC</span>
            </span>
            <span v-else>&mdash;</span>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('Fee Paid Amount') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('Fee Paid Amount Tooltip')"
              />
            </div>
          </template>
        </v-item>
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value">
            <span v-if="feeDiscountAccountInfo" class="font-mono">
              % {{ makerFeeDiscount }} / {{ takerFeeDiscount }}
            </span>
            <span v-else class="text-xs text-gray-400 font-mono"></span>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('Fee Paid Amount') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('Maker/Taker Discount')"
              />
            </div>
          </template>
        </v-item>
      </div>
    </div>
    <v-user-wallet-connect-warning v-else cta />
  </v-card>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Vue from 'vue'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'
import VItem from '~/components/partials/common/stats/item.vue'
import {
  FeeDiscountAccountInfo,
  TradingRewardsCampaign
} from '~/types/exchange'

export default Vue.extend({
  components: {
    VItem
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

    estimatedRewards(): string {
      const {
        tradeRewardsPoints,
        feeDiscountAccountInfo,
        tradingRewardsCampaign
      } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!tradingRewardsCampaign) {
        return ''
      }

      if (!tradeRewardsPoints) {
        return ''
      }

      if (!tradeRewardsPoints.length) {
        return ''
      }

      const [points] = tradeRewardsPoints
      const [
        schedule
      ] = tradingRewardsCampaign.tradingRewardPoolCampaignScheduleList
      const [inj] = schedule.maxCampaignRewardsList // TODO

      return new BigNumberInWei(points)
        .times(tradingRewardsCampaign.totalTradeRewardPoints)
        .dividedBy(inj.amount)
        .toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    tierLevel(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      return feeDiscountAccountInfo
        ? new BigNumberInBase(feeDiscountAccountInfo.tierLevel).toFormat(0)
        : ''
    },

    stakedAmount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.accountInfo.stakedAmount
      ).toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    feeAmount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.feePaidAmount
      )
        .toBase(6 /* USDT */)
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    makerFeeDiscount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.makerDiscountRate
      )
        .toBase()
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    takerFeeDiscount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.takerDiscountRate
      )
        .toBase()
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>
