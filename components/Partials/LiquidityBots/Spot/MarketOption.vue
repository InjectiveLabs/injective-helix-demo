<script lang="ts" setup>
import { BaseDropdownOption } from '@injectivelabs/ui-shared'

const props = defineProps({
  option: {
    type: Object as PropType<BaseDropdownOption>,
    required: true
  }
})

const spotStore = useSpotStore()
const gridStrategyStore = useGridStrategyStore()

const token = computed(
  () => spotStore.markets.find((m) => m.slug === props.option.value)?.baseToken
)

const marketHasActiveStrategy = computed(() => {
  const market = spotStore.markets.find(
    ({ slug }) => slug === props.option.value
  )

  return gridStrategyStore.activeStrategies.find(
    (strategy) => strategy.marketId === market?.marketId
  )
})
</script>

<template>
  <div class="flex items-center space-x-2 font-semibold tracking-wide w-full">
    <div>
      <CommonTokenIcon v-if="token" v-bind="{ isSm: true, token }" />
    </div>

    <div>{{ option?.display }}</div>

    <div v-if="marketHasActiveStrategy" class="flex-1 flex justify-end">
      <div class="bg-green-500 w-2.5 h-2.5 rounded-full" />
    </div>
  </div>
</template>
