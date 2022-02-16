<template>
  <thead>
    <tr>
      <th v-if="marketColumnEnabled" class="text-left">
        {{ $t('trade.pair') }}
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
      <th class="text-left">
        {{ $t('trade.unfilled') }}
      </th>
      <th class="text-left">
        {{ $t('trade.filled') }}
      </th>
      <th class="text-left">
        {{ $t('trade.total') }}
      </th>
      <th></th>
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
