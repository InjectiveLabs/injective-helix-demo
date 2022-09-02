<template>
  <thead class="bg-helixGray-950">
    <tr>
      <th class="text-left">
        <div class="flex items-center justify-start">
          <span>{{ $t('trade.time') }}</span>
          <IconInfoTooltip class="ml-2" :tooltip="$t('trade.timeTooltip', { type: 'order' })" />
        </div>
      </th>
      <th class="text-left">
        {{ $t('trade.market') }}
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
          <IconInfoTooltip class="ml-2" :tooltip="$t('trade.amount_tooltip')" />
        </div>
      </th>
      <th class="text-right">
        {{ $t('trade.total') }}
      </th>
      <th class="text-right">
        {{ $t('trade.triggerCondition') }}
      </th>
      <th class="text-right">
        {{ $t('trade.status') }}
      </th>
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
