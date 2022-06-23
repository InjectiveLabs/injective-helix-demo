<template>
  <HocLoading :status="status">
    <div v-if="isUserWalletConnected">
      <div class="flex md:grid grid-cols-12 gap-6 overflow-x-auto hide-scrollbar" @scroll="handleScroll">
        <div class="fee-discounts-statistic bg-gray-800 rounded-lg md:col-span-6 p-6">
          <div class="flex flex-col">
            <div class="flex justify-start gap-6 lg:gap-8">
              <div class="flex flex-col border-r border-gray-500 pr-6 lg:pr-8">
                <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
                  {{ $t('fee_discounts.my_tier') }}
                </span>
                <span class="uppercase text-xl lg:text-2xl font-bold tracking-normal text-primary-500">
                  #{{ tierLevel }}
                </span>
              </div>
              <div class="flex flex-col">
                <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
                  {{ $t('fee_discounts.maker') }}
                </span>
                <span class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap">
                  <b class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono">{{ makerFeeDiscount }}%</b> {{ $t('fee_discounts.off') }}
                </span>
              </div>
              <div class="flex flex-col">
                <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
                  {{ $t('fee_discounts.taker') }}
                </span>
                <span class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap">
                  <b class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono">{{ takerFeeDiscount }}%</b> {{ $t('fee_discounts.off') }}
                </span>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-xs text-gray-400">{{ $t('fee_discounts.update_daily') }}. {{ $t('fee_discounts.last_updated_at') }} {{ lastUpdateTimestamp }}</span>
            </div>
          </div>
        </div>
        <div class="fee-discounts-statistic bg-gray-800 rounded-lg md:col-span-3 p-6">
            <div class="flex flex-col">
            <div class="flex justify-start gap-6 lg:gap-8">
              <div class="flex flex-col">
                <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
                  {{ $t('fee_discounts.my_staked_amount') }}
                </span>
                <span class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap">
                  <b class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono">{{ stakedAmount }}</b> INJ
                </span>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-xs text-gray-400">
                {{ $t('fee_discounts.current_apy') }}: {{ aprToFormat }}%
              </span>
            </div>
          </div>
        </div>
        <div class="fee-discounts-statistic bg-gray-800 rounded-lg md:col-span-3 p-6">
            <div class="flex flex-col">
            <div class="flex justify-start gap-6 lg:gap-8">
              <div class="flex flex-col">
                <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
                  {{ $t('fee_discounts.my_trading_volume') }}
                </span>
                <span class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap">
                  <b class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono">{{ volumeToFormat }}</b> USD
                </span>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-xs text-gray-400">{{ $t('fee_discounts.in_past_days', { days: daysPassed }) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-2 justify-center mt-4 md:hidden">
        <div
          v-for="i in 3"
          :key="`fee-discount-statistic-slide-${i}`"
          class="w-2 h-2 rounded-full bg-white"
          :class="slideIndex === i - 1 ? 'bg-opacity-50' : 'bg-opacity-10'"
        />
      </div>
    </div>
  </HocLoading>
</template>

<script lang="ts">
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import Vue from 'vue'
import { format, intervalToDuration } from 'date-fns'
import { cosmosSdkDecToBigNumber, FeeDiscountAccountInfo, FeeDiscountSchedule } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { getAbbreviatedVolume } from '~/app/utils/market'

export default Vue.extend({
  data() {
    return {
      status: new Status(StatusType.Loading),
      slideIndex: 0,
      UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  },

  computed: {
    apr(): BigNumberInBase {
      return this.$accessor.params.apr
    },

    aprToFormat(): string {
      const { apr } = this

      return apr.times(100).toFormat(2)
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    lastUpdateTimestamp(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo || !feeDiscountAccountInfo.accountTtl) {
        return '-'
      }

      return format(Number(feeDiscountAccountInfo.accountTtl.ttlTimestamp) * 1000, 'yyyy-MM-dd HH:mm:ss (zzz)')
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    feeDiscountSchedule(): FeeDiscountSchedule | undefined {
      return this.$accessor.exchange.feeDiscountSchedule
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

    volume(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo || !feeDiscountAccountInfo.accountInfo || !feeDiscountAccountInfo.accountInfo.volume) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(feeDiscountAccountInfo.accountInfo.volume).toBase()
    },

    volumeToFormat(): string {
      const { volume } = this

      return getAbbreviatedVolume(volume)
    },

    daysPassed(): string {
      const { feeDiscountSchedule } = this

      if (!feeDiscountSchedule) {
        return '0'
      }

      const totalinSeconds = feeDiscountSchedule.bucketDuration * feeDiscountSchedule.bucketCount

      const { days } = intervalToDuration({ start: 0, end: totalinSeconds * 1000 })

      if (!days) {
        return '0'
      }

      return days.toString()
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
        .times(100)
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
        .times(100)
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
  },

  methods: {
    handleScroll(e: Event) {
      const target = e.target as HTMLElement
      const offset = target.scrollLeft
      const viewWidth = target.clientWidth
      const total = target.scrollWidth - viewWidth
      this.slideIndex = Math.round(offset / total * 2)
    }
  }
})
</script>

<style lang="scss" scoped>
.fee-discounts-statistic {
  flex: 0 0 100%;
}
</style>
