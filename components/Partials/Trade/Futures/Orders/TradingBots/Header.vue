<script setup lang="ts">
import { SharedDropdownOption } from '@shared/types'
import { PerpOrdersTradingBotsView, PerpetualMarketCyTags } from '@/types'

const breakpoints = useBreakpointsTw()
const gridStrategyStore = useGridStrategyStore()

const lg = breakpoints['3xl']

const props = withDefaults(
  defineProps<{
    modelValue: PerpOrdersTradingBotsView
  }>(),
  {}
)

const emit = defineEmits<{
  'update:modelValue': [value: PerpOrdersTradingBotsView]
}>()

const view = useVModel(props, 'modelValue', emit)

const options = computed(() => {
  const items: SharedDropdownOption[] = [
    {
      display: `activity.${PerpOrdersTradingBotsView.ActiveStrategies}`,
      value: PerpOrdersTradingBotsView.ActiveStrategies,
      description: `${gridStrategyStore.activeDerivativeStrategies.length}`
    },
    {
      display: `activity.${PerpOrdersTradingBotsView.RemovedStrategies}`,
      value: PerpOrdersTradingBotsView.RemovedStrategies,
      description: `${gridStrategyStore.removedStrategies.length}`
    }
  ]

  return items
})
</script>

<template>
  <div class="h-header border-b-2 flex sticky top-0 bg-coolGray-975 z-10">
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderDetailsDropdown)"
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
        v-for="value in Object.values(PerpOrdersTradingBotsView)"
        :key="value"
        v-model="view"
        v-bind="{ value }"
        class="flex items-center px-4 tab-field"
        active-classes="!text-white"
      >
        {{ $t(`activity.${value}`) }}
      </AppButtonSelect>
    </template>
  </div>
</template>
