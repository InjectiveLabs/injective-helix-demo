<template>
  <VCard>
    <HocLoading :status="status">
      <div v-if="isUserWalletConnected">
        <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 mt-4">
          <VItem class="col-span-2 lg:col-span-3">
            <template slot="value">
              <span
                v-if="feeDiscountAccountInfo"
                class="font-mono text-lg leading-5"
              >
                {{ tierLevel }}
              </span>
              <span v-else class="text-xs text-gray-400 font-mono">
                &mdash;
              </span>
            </template>
            <template slot="title">
              <div class="flex items-center justify-center">
                {{ $t('My Tier') }}
                <IconInfoTooltip
                  class="ml-2"
                  :tooltip="$t('My Tier Tooltip')"
                />
              </div>
            </template>
          </VItem>
          <VItem class="col-span-2 lg:col-span-3">
            <template slot="value">
              <VEmpNumber
                v-if="feeDiscountAccountInfo"
                :number="stakedAmount"
                :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
              >
                <span>INJ</span>
              </VEmpNumber>
            </template>
            <template slot="title">
              <div class="flex items-center justify-center">
                {{ $t('My Staked Amount') }}
                <IconInfoTooltip
                  class="ml-2"
                  :tooltip="$t('My Staked Amount Tooltip')"
                />
              </div>
            </template>
          </VItem>
          <VItem class="col-span-2 lg:col-span-3">
            <template slot="value">
              <VEmpNumber v-if="feeDiscountAccountInfo" :number="feePaidAmount">
                <span>USD</span>
              </VEmpNumber>
              <span v-else>&mdash;</span>
            </template>
            <template slot="title">
              <div class="flex items-center justify-center">
                {{ $t('My Fee Paid Amount') }}
                <IconInfoTooltip
                  class="ml-2"
                  :tooltip="$t('My Fee Paid Amount Tooltip')"
                />
              </div>
            </template>
          </VItem>
          <VItem class="col-span-2 lg:col-span-3">
            <template slot="value">
              <span
                v-if="feeDiscountAccountInfo"
                class="font-mono text-lg leading-5"
              >
                % {{ makerFeeDiscount }} / {{ takerFeeDiscount }}
              </span>
              <span v-else class="text-xs text-gray-400 font-mono"></span>
            </template>
            <template slot="title">
              <div class="flex items-center justify-center">
                {{ $t('trade.myMakerTakerDiscount') }}
                <IconInfoTooltip
                  class="ml-2"
                  :tooltip="$t('trade.myMakerTakerDiscountTooltip')"
                />
              </div>
            </template>
          </VItem>
        </div>
      </div>
      <UserWalletConnectWarning v-else cta />
    </HocLoading>
  </VCard>
</template>

<script lang="ts">
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import Vue from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'
import VItem from '~/components/partials/common/stats/item.vue'

export default Vue.extend({
  components: {
    VItem
  },

  data() {
    return {
      status: new Status(StatusType.Loading),

      UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
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

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
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

    feePaidAmount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ZERO_IN_BASE
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(
        cosmosSdkDecToBigNumber(
          feeDiscountAccountInfo.accountInfo.feePaidAmount
        )
      ).toBase(6 /* USDT */)
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
  },

  mounted() {
    Promise.all([this.$accessor.exchange.fetchFeeDiscountAccountInfo()])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  }
})
</script>
