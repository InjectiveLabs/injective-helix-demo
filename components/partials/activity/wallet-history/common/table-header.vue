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
        {{ $t('walletHistory.transfers.type') }}
      </th>

      <th class="text-left">
        {{ $t('walletHistory.transfers.asset') }}
      </th>

      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('walletHistory.transfers.amount') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('walletHistory.transfers.amountTooltip')"
          />
        </div>
      </th>

      <th class="text-left">
        {{ $t('walletHistory.transfers.origin') }}
      </th>

      <th class="text-left">
        {{ $t('walletHistory.transfers.destination') }}
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
