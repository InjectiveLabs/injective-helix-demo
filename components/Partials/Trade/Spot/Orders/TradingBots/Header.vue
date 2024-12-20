<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SharedDropdownOption } from '@shared/types'
import { SpotOrdersTradingBotsView, SpotMarketCyTags } from '@/types'

const spotStore = useSpotStore()
const breakpoints = useBreakpointsTw()
const gridStrategyStore = useGridStrategyStore()

const props = withDefaults(
  defineProps<{
    modelValue: SpotOrdersTradingBotsView
  }>(),
  {}
)

const emit = defineEmits<{
  'update:modelValue': [value: SpotOrdersTradingBotsView]
}>()

const lg = breakpoints['3xl']
const xl = breakpoints['5xl']

const view = useVModel(props, 'modelValue', emit)

const options = computed(() => {
  const items: SharedDropdownOption[] = [
    {
      display: `activity.${SpotOrdersTradingBotsView.ActiveStrategies}`,
      value: SpotOrdersTradingBotsView.ActiveStrategies,
      description: `${gridStrategyStore.activeStrategies.length}`
    },
    {
      display: `activity.${SpotOrdersTradingBotsView.RemovedStrategies}`,
      value: SpotOrdersTradingBotsView.RemovedStrategies,
      description: `${gridStrategyStore.removedStrategies.length}`
    },
    {
      display: `activity.${SpotOrdersTradingBotsView.Orders}`,
      value: SpotOrdersTradingBotsView.Orders,
      description: `${spotStore.subaccountOrders.length}`
    },
    {
      display: `activity.${SpotOrdersTradingBotsView.OrderHistory}`,
      value: SpotOrdersTradingBotsView.OrderHistory,
      description: `${spotStore.subaccountOrderHistory.length}`
    },
    {
      display: `activity.${SpotOrdersTradingBotsView.TradeHistory}`,
      value: SpotOrdersTradingBotsView.TradeHistory,
      description: `${spotStore.subaccountTrades.length}`
    }
  ]

  return items
})
</script>

<template>
  <div class="h-header border-b flex sticky top-0 bg-coolGray-975 z-10">
    <AppTabSelect
      v-if="!lg"
      v-bind="{
        options
      }"
      v-model="view"
      class="border-r"
    >
      <template #default="{ selected }">
        <button
          class="px-2"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderDetailsDropDown)"
        >
          {{ $t(selected?.display || '') }}
          {{
            Number.isInteger(Number(selected?.description))
              ? `(${selected?.description || 0})`
              : ''
          }}
        </button>
      </template>

      <template #option="{ option }">
        <button
          :data-cy="`${dataCyTag(
            SpotMarketCyTags.OrderDetailsDropdownOptions
          )}-${option.display}`"
        >
          {{ $t(option.display) }}
          {{
            Number.isInteger(Number(option.description))
              ? `(${option.description})`
              : ''
          }}
        </button>
      </template>
    </AppTabSelect>

    <AppButtonSelect
      v-for="{ value, display, description } in options"
      v-else
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center text-coolGray-450 font-medium"
      :class="[xl ? 'px-3 text-xs' : 'px-2 text-xs']"
      active-classes="text-white"
    >
      {{ $t(display) }}
      {{
        Number.isInteger(Number(description)) && Number(description) > 0
          ? `(${description})`
          : ''
      }}
    </AppButtonSelect>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
