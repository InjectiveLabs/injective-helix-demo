<template>
  <thead class="bg-gray-800">
    <tr>
      <th class="text-left">
        {{ $t('trade.pair') }}
      </th>
      <th class="text-left">
        <span>{{ $t('trade.side') }}</span>
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
        {{ $t('trade.unfilled') }}
      </th>
      <th class="text-right">
        {{ $t('trade.filled') }}
      </th>
      <th v-if="!isBinaryOptionsPage" class="text-right">
        {{ $t('trade.leverage') }}
      </th>
      <th class="text-right">
        {{ $t('trade.total') }}
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
