<template>
  <thead>
    <tr>
      <th class="text-center">&nbsp;</th>
      <th v-if="marketColumnEnabled" class="text-left">
        <span>{{ $t('market') }}</span>
      </th>
      <th class="text-right">
        <span>{{ $t('entry_price') }}</span>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('amount') }}</span>
          <v-icon-info-tooltip class="ml-2" :tooltip="$t('amount_tooltip')" />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('liquidation_price') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('liquidation_price_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-center">
          {{ $t('side') }}
          <v-icon-info-tooltip class="ml-2" :tooltip="$t('side_tooltip')" />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('unrealized_pnl') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('unrealized_pnl_tooltip')"
          />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('notional_value') }}</span>
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('notional_value_tooltip')"
          />
        </div>
      </th>
      <th class="text-right">
        <span>{{ $t('margin') }}</span>
      </th>
      <th class="text-right">
        <span>{{ $t('leverage') }}</span>
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
