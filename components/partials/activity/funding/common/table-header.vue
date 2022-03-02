<template>
  <thead class="bg-gray-800">
    <tr>
      <th class="text-left">
        <div class="flex items-center">
          {{ $t('trade.time') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.timestamp_tooltip')"
          />
        </div>
      </th>

      <th class="text-left">
        {{ $t('fundingHistory.transfers.asset') }}
      </th>

      <th class="text-left">
        {{ $t('fundingHistory.transfers.type') }}
      </th>

      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('fundingHistory.transfers.amount') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('fundingHistory.transfers.amountTooltip')"
          />
        </div>
      </th>

      <th class="text-left">
        {{ $t('fundingHistory.transfers.origin') }}
      </th>

      <th class="text-left">
        {{ $t('fundingHistory.transfers.destination') }}
      </th>

      <th></th>
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
