<template>
  <thead class="bg-gray-800">
    <tr>
      <th class="text-left w-1/5">
        <div class="flex items-center">
          {{ $t('trade.time') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.timestamp_tooltip')"
          />
        </div>
      </th>

      <th class="text-left w-3/5">
        {{ $t('trade.pair') }}
      </th>

      <th class="w-1/5">
        <div class="flex items-center justify-end">
          <span>{{ $t('fundingPayments.payment') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('fundingPayments.paymentTooltip')"
          />
        </div>
      </th>
    </tr>
  </thead>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    //
  }
})
</script>
