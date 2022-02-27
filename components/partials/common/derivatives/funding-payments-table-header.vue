<template>
  <thead>
    <tr>
      <th class="text-left w-1/5">
        <div class="flex items-center">
          {{ $t('trade.timestamp') }}
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
          <span>{{ $t('trade.total') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('fundingPayments.totalTooltip')"
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
