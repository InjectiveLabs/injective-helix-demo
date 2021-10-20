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
      <th class="text-right">
        {{ $t('total') }}
      </th>
      <th class="text-right">
        {{ $t('leverage') }}
      </th>
      <th>
        <div class="flex items-center justify-center">
          {{ $t('side') }}
          <v-icon-info-tooltip class="ml-2" :tooltip="$t('side_tooltip')" />
        </div>
      </th>
      <th class="text-right">
        {{ $t('unfilled') }}
      </th>
      <th class="text-center">
        {{ $t('filled') }}
      </th>
      <th class="text-center">
        {{ $t('actions') }}
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
