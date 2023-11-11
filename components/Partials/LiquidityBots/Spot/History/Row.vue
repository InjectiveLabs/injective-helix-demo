<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { format } from 'date-fns'

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  },

  modelValue: {
    type: String,
    required: true
  },

  value: {
    type: String,
    required: true
  }
})

defineEmits<{
  'update:modelValue': [string]
}>()

const spotStore = useSpotStore()

const date = computed(() =>
  format(Number(props.strategy.updatedAt), 'dd LLL yyyy - HH:mm:ss O')
)

const market = computed(
  () => spotStore.markets.find((m) => m.marketId === props.strategy.marketId)!
)
</script>

<template>
  <div class="border-b">
    <BaseAccordion
      v-bind="{
        modelValue,
        value
      }"
      @update:model-value="
        (value) =>
          $emit(
            'update:modelValue',
            (value as string) === modelValue ? '' : (value as string)
          )
      "
    >
      <template #header="{ isActive }">
        <div
          class="flex justify-between items-center py-2 cursor-pointer select-none"
        >
          <div class="flex items-center space-x-2 flex-1">
            <p class="text-sm font-semibold">{{ date }}</p>
            <CommonTokenIcon :token="market.baseToken" sm />
          </div>

          <div :class="{ 'rotate-180': isActive }">
            <BaseIcon name="chevron-down" is-md />
          </div>
        </div>
      </template>
      <template #content>
        <PartialsLiquidityBotsSpotHistoryDetails
          v-bind="{ strategy }"
          class="pb-4"
        />
      </template>
    </BaseAccordion>
  </div>
</template>
