<template>
  <thead class="bg-gray-800">
    <tr>
      <th class="text-left">
        <span>{{ $t('trade.pair') }}</span>
      </th>
      <th>
        <div class="flex items-center">
          {{ $t('trade.side') }}
        </div>
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
      <th class="text-right">
        <span>{{ $t('trade.entryMark') }}</span>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.estLiqPrice') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.liquidation_price_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.unrealized_pnl') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('trade.unrealized_pnl_tooltip')"
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
      <th class="text-right">
        <span>{{ $t('trade.margin') }}</span>
      </th>
      <th class="text-right">
        <span>{{ $t('trade.leverage') }}</span>
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
