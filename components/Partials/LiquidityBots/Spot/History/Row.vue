<script lang="ts" setup>
import { format } from 'date-fns'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

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

const { percentagePnl, pnl } = useActiveGridStrategy(
  market,
  computed(() => props.strategy)
)

const { valueToString: pnlToString } = useSharedBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})
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
          <div class="flex items-center justify-between gap-2 flex-1 mr-2">
            <p class="text-sm font-semibold">{{ date }}</p>

            <div class="flex items-center gap-2">
              <div
                class="text-xs"
                :class="[pnl.isPositive() ? 'text-green-500' : 'text-red-500']"
              >
                <span class="font-semibold">
                  {{ pnlToString }}
                  <span class="text-xs align-text-bottom ml-1">
                    {{ market?.quoteToken.symbol }}
                  </span>
                </span>
                <span class="text-2xs opacity-75 ml-1">
                  ({{ percentagePnl }} %)
                </span>
              </div>

              <CommonTokenIcon v-if="market" :token="market.baseToken" is-sm />
            </div>
          </div>

          <div :class="{ 'rotate-180': isActive }">
            <SharedIcon name="chevron-down" is-md />
          </div>
        </div>
      </template>
      <template #content>
        <PartialsLiquidityBotsSpotHistoryDetails
          v-bind="{ ...$attrs, strategy }"
          class="pb-4"
        />
      </template>
    </BaseAccordion>
  </div>
</template>
