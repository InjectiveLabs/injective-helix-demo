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
        {{ $t('trade.pair') }}
      </th>

      <th class="text-left">
        {{ $t('trade.type') }}
      </th>

      <th class="text-left">
        {{ $t('trade.side') }}
      </th>
      <th class="text-right">
        {{ $t('trade.price') }}
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.amount') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.amount_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          {{ $t('trade.fee') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.fees_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.total') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.total_tooltip')"
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
