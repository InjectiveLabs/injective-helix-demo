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
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.amount') }}</span>
          <IconInfoTooltip class="ml-2" :tooltip="$t('trade.amount_tooltip')" />
        </div>
      </th>
      <th class="text-right">
        <span>{{ $t('trade.entryMark') }}</span>
      </th>
      <th v-if="!isBinaryOptionsPage">
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.estLiqPrice') }}</span>
          <IconInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.liquidation_price_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.unrealized_pnl') }}</span>
          <IconInfoTooltip
            class="ml-2"
            :tooltip="$t('trade.unrealized_pnl_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('trade.total') }}</span>
          <IconInfoTooltip class="ml-2" :tooltip="$t('trade.total_tooltip')" />
        </div>
      </th>
      <th class="text-right">
        <span>{{ $t('trade.margin') }}</span>
      </th>
      <th v-if="!isBinaryOptionsPage" class="text-right">
        <span>{{ $t('trade.leverage') }}</span>
      </th>
      <th></th>
    </tr>
  </thead>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  computed: {
    isBinaryOptionsPage(): boolean {
      return this.$route.name === 'binary-options-binaryOption'
    }
  }
})
</script>
