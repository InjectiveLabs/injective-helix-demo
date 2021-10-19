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
        <div class="flex items-center justify-center">
          {{ $t('execution_type') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('execution_type_tooltip')"
          />
        </div>
      </th>
      <th class="text-right">
        <div class="flex items-center justify-center">
          {{ $t('time') }}
          <v-icon-info-tooltip class="ml-2" :tooltip="$t('time_tooltip')" />
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
