<template>
  <thead>
    <tr>
      <th class="text-left">
        <div class="flex items-center">
          {{ $t('trade.timestamp') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.timestamp_tooltip')"
          />
        </div>
      </th>

      <th v-if="marketColumnEnabled" class="text-left">
        {{ $t('trade.pair') }}
      </th>

      <th>
        <div class="flex items-center">
          {{ $t('trade.type') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.type_tooltip')"
          />
        </div>
      </th>

      <th>
        <div class="flex items-center">
          <span>{{ $t('trade.side') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.side_tooltip')"
          />
        </div>
      </th>
      <th class="text-left">
        {{ $t('trade.price') }}
      </th>
      <th>
        <div class="flex items-center">
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
    marketColumnEnabled: {
      required: false,
      default: false,
      type: Boolean
    }
  }
})
</script>
