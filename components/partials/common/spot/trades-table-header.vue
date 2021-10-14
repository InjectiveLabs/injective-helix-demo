<template>
  <thead>
    <tr>
      <th v-if="marketColumnEnabled" class="text-left">
        {{ $t('market') }}
      </th>
      <th class="text-right">
        {{ $t('price') }}
      </th>
      <th>
        <div class="flex items-center justify-end">
          <span>{{ $t('amount') }}</span>
          <v-icon-info-tooltip class="ml-2" :tooltip="$t('amount_tooltip')" />
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
      <th>
        <div class="flex items-center justify-end">
          {{ $t('fee') }}
          <v-icon-info-tooltip class="ml-2" :tooltip="$t('fees_tooltip')" />
        </div>
      </th>
      <th>
        <div class="flex items-center justify-center">
          <span>{{ $t('side') }}</span>
          <v-icon-info-tooltip class="ml-2" :tooltip="$t('side_tooltip')" />
        </div>
      </th>
      <th class="text-center">
        {{ $t('execution_type') }}
      </th>
      <th class="text-right">
        {{ $t('time') }}
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
