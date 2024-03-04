<script setup lang="ts">
import { SpotOrdersStandardView } from '@/types'

const view = ref(SpotOrdersStandardView.OpenOrders)
</script>

<template>
  <div class="h-header border-b flex">
    <AppButtonSelect
      v-for="value in Object.values(SpotOrdersStandardView)"
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(`activity.${value}`) }}
    </AppButtonSelect>
  </div>
</template>
