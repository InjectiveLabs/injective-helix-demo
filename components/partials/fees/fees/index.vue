<template>
  <div class="table-responsive h-full min-h-orders max-h-xs 4xl:max-h-lg">
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
                <span class="text-2xs text-gray-400 ml-2">(INJ)</span>
              </span>
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('fee_discount_staked_amount_tooltip')"
              />
            </div>
          </th>
          <th class="text-center w-32"></th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fees_paid') }}
                <span class="text-2xs text-gray-400 ml-2">(USDT/USDC)</span>
              </span>
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('fee_discount_fees_paid_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discount_maker_taker') }}
              </span>
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('fee_discount_maker_taker_tooltip')"
              />
            </div>
          </th>
        </tr>
      </thead>

      <tbody v-if="feeDiscountSchedule">
        <tr
          is="v-tier"
          v-for="(tier, index) in feeDiscountSchedule.tierInfosList"
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
import Tier from '~/components/partials/fees/fees/tier.vue'
import { FeeDiscountSchedule } from '~/types/exchange'

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
    }
  }
})
</script>
