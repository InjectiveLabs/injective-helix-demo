<script setup lang="ts">
import { SharedDropdownOption } from '@shared/types'
import { PerpetualMarketCyTags, PerpOrdersTradingBotsView } from '@/types'

const breakpoints = useBreakpointsTw()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()

const lg = breakpoints['3xl']

const props = withDefaults(
  defineProps<{
    modelValue: PerpOrdersTradingBotsView
    positionsLength: number
  }>(),
  {}
)

const emit = defineEmits<{
  'update:modelValue': [value: PerpOrdersTradingBotsView]
}>()

const view = useVModel(props, 'modelValue', emit)

const options = computed<SharedDropdownOption[]>(() => [
  {
    display: `activity.${PerpOrdersTradingBotsView.ActiveStrategies}`,
    value: PerpOrdersTradingBotsView.ActiveStrategies,
    description: `${gridStrategyStore.activeStrategies.length}`
  },
  {
    display: `activity.${PerpOrdersTradingBotsView.RemovedStrategies}`,
    value: PerpOrdersTradingBotsView.RemovedStrategies,
    description: `${gridStrategyStore.removedStrategies.length}`
  },
  {
    display: `activity.${PerpOrdersTradingBotsView.Positions}`,
    value: PerpOrdersTradingBotsView.Positions,
    description: `${props.positionsLength}`
  },
  {
    display: `activity.${PerpOrdersTradingBotsView.OpenOrders}`,
    value: PerpOrdersTradingBotsView.OpenOrders,
    description: `${derivativeStore.subaccountOrdersCount}`
  },
  {
    display: `activity.${PerpOrdersTradingBotsView.OrderHistory}`,
    value: PerpOrdersTradingBotsView.OrderHistory
  },
  {
    display: `activity.${PerpOrdersTradingBotsView.TradeHistory}`,
    value: PerpOrdersTradingBotsView.TradeHistory
  }
])
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
          :data-cy="
            dataCyTag(PerpetualMarketCyTags.OrderDetailsDropdownOptions)
          "
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
            PerpetualMarketCyTags.OrderDetailsDropdownOptions
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

    <template v-else>
      <AppButtonSelect
        v-for="{ value, display, description } in options"
        :key="value"
        v-model="view"
        v-bind="{ value }"
        class="flex items-center text-coolGray-450 font-medium px-2 text-xs"
        active-classes="text-white"
      >
        {{ $t(display) }}
        {{
          Number.isInteger(Number(description)) && Number(description) > 0
            ? `(${description})`
            : ''
        }}
      </AppButtonSelect>
    </template>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
