<template>
  <div class="table-responsive h-full">
    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            {{ $t('tier') }}
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discount_staked_amount') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discount_staked_amount_tooltip')"
              />
            </div>
          </th>
          <th class="text-center w-32"></th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('trade.fees_paid') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discount_fees_paid_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discount_maker') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discount_maker_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discount_taker') }}
              </span>
              <IconInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discount_taker_tooltip')"
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
          feePaidAmount: '0'
        },
        ...feeDiscountSchedule.tierInfosList
      ]
    }
  }
})
</script>
