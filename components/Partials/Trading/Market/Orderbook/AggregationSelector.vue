<script lang="ts" setup>
import { aggregationList } from '@/app/data/aggregation'

const props = defineProps({
  aggregation: {
    type: String,
    required: true
  },

  minTick: {
    type: String,
    required: true
  },

  maxTick: {
    type: String as PropType<string | null>,
    default: undefined
  }
})

const emit = defineEmits<{
  'update:aggregation': [latestAggregation: string]
}>()

const aggregation = computed({
  get: (): string => props.aggregation,
  set: (latestAggregation) => {
    emit('update:aggregation', latestAggregation)
  }
})

const filteredList = computed(() => {
  if (props.maxTick) {
    const startIndex = aggregationList.findIndex(
      ({ value }) => value === props.maxTick
    )
    const endIndex = aggregationList.findIndex(
      ({ value }) => value === props.minTick
    )

    return aggregationList.slice(startIndex, endIndex + 1)
  }

  const index = aggregationList.findIndex(
    ({ value }) => value === props.minTick
  )

  return aggregationList.slice(Math.max(index - 3, 0), index + 1)
})
</script>

<template>
  <AppSelect
    v-model="aggregation"
    :options="filteredList"
    wrapper-class="h-6 text-gray-400"
  >
    <template #default="{ selected }">
      <div class="text-xs cursor-pointer">
        <span v-if="selected">
          {{ selected.display }}
        </span>
      </div>
    </template>

    <template #option="{ option }">
      <span class="text-sm font-semibold">
        {{ option.display }}
      </span>
    </template>
  </AppSelect>
</template>
