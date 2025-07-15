<script lang="ts" setup>
import { format } from 'date-fns'

const props = withDefaults(defineProps<{ date?: number }>(), {
  date: undefined
})

const DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss'

const lastUpdated = computed(() =>
  props.date ? format(props.date, DATE_FORMAT) : ''
)
</script>

<template>
  <div class="border-b flex justify-between items-end">
    <button class="border-b-2 border-blue-500 text-blue-500 -mb-[1px] p-2">
      {{ $t('lpRewards.overall') }}
    </button>

    <div class="flex space-x-4 items-end mb-2">
      <p v-if="lastUpdated" class="text-coolGray-300 text-xs">
        {{ $t('lpRewards.lastUpdated', { date: lastUpdated }) }}
      </p>
    </div>
  </div>
</template>
