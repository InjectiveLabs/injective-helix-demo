<template>
  <v-card>
    <div v-if="isUserWalletConnected">
      <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 mt-4">
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value">
            <span
              v-if="feeDiscountAccountInfo && tierLevel > 0"
              class="font-mono"
            >
              {{ tierLevel }}
            </span>
            <span v-else class="text-xs text-gray-400 font-mono">&mdash;</span>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('My Tier') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('My Tier Tooltip')"
              />
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
              {{ $t('My Staked Amount') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('My Staked Amount Tooltip')"
              />
            </div>
          </template>
        </v-item>
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value">
            <span v-if="feeDiscountAccountInfo" class="font-mono text-lg">
              {{ feePaidAmount }}
              <span class="text-xs text-gray-400">USDT/USDC</span>
            </span>
            <span v-else>&mdash;</span>
          </template>
          <template slot="title">
            <div class="flex items-center justify-center">
              {{ $t('My Fee Paid Amount') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('My Fee Paid Amount Tooltip')"
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
              {{ $t('My Maker/Taker Discount') }}
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('My Maker/Taker Discount Tooltip')"
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

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return feeDiscountAccountInfo
        ? new BigNumberInBase(feeDiscountAccountInfo.tierLevel).toNumber()
        : 0
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

    feePaidAmount(): string {
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
