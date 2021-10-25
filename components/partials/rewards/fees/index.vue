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
              {{ $t('staked_amount') }}
              <span class="text-2xs text-gray-400 ml-2">(INJ)</span>
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              {{ $t('fees_paid') }}
              <span class="text-2xs text-gray-400 ml-2">(USDT/USDC)</span>
            </div>
          </th>
          <th class="text-right">
            {{ $t('maker_fee_discount') }}
          </th>
          <th class="text-right">
            {{ $t('taker_fee_discount') }}
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
import Tier from '~/components/partials/rewards/fees/tier.vue'
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
