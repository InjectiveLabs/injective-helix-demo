<template>
  <div class="table-responsive h-full">
    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            {{ $t('fee_discounts.tier') }}
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.staked_amount') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.staked_amount_tooltip')"
              />
            </div>
          </th>
          <th class="text-center w-32"></th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.trading_volume') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.trading_volume_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.maker_rate_discount') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.maker_rate_discount_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.taker_rate_discount') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.taker_rate_discount_tooltip')"
              />
            </div>
          </th>
        </tr>
      </thead>

      <tbody v-if="feeDiscountSchedule">
        <tr
          is="v-tier"
          v-for="(tier, index) in tierLevelsWithZeroTierLevel"
          :key="`tier-${index}`"
          :tier="tier"
          :index="index"
        ></tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { FeeDiscountSchedule, FeeDiscountTierInfo } from '@injectivelabs/sdk-ts'
import Tier from '~/components/partials/fee-discounts/fees/tier.vue'

export default Vue.extend({
  components: {
    'v-tier': Tier
  },

  data() {
    return {
      status: new Status()
    }
  },

  computed: {
    feeDiscountSchedule(): FeeDiscountSchedule | undefined {
      return this.$accessor.exchange.feeDiscountSchedule
    },

    tierLevelsWithZeroTierLevel(): FeeDiscountTierInfo[] {
      const { feeDiscountSchedule } = this

      if (!feeDiscountSchedule) {
        return []
      }

      return [
        {
          makerDiscountRate: '0',
          takerDiscountRate: '0',
          stakedAmount: '0',
          feePaidAmount: '0',
          volume: '0'
        },
        ...feeDiscountSchedule.tierInfosList
      ]
    }
  }
})
</script>
