<script lang="ts" setup>
import { TradeExecutionType, TradeField, TradeSubPage } from '@/types'

const { t } = useLang()
const route = useRoute()
const emit = defineEmits<{
  'form:reset': []
}>()

const filterList = [TradeExecutionType.LimitFill, TradeExecutionType.Market]
const dropdownOptions = [
  {
    display: t('trade.stopLimit'),
    value: TradeExecutionType.StopLimit
  },
  {
    display: t('trade.stopMarket'),
    value: TradeExecutionType.StopMarket
  }
]

const isSpot = route.name === TradeSubPage.Spot

const { value: tradingType } = useStringField({
  name: TradeField.TradingType,
  initialValue: TradeExecutionType.LimitFill
})

function resetForm() {
  emit('form:reset')
}
</script>

<template>
  <div class="flex items-center justify-start gap-4">
    <AppSelectButton
      v-for="tradeType in filterList"
      :key="`trade-type-${tradeType}`"
      v-model="tradingType"
      :value="tradeType"
      @update:modelValue="resetForm"
    >
      <template #default="{ isActive }">
        <span
          class="text-xs uppercase tracking-wide cursor-pointer"
          :class="[isActive ? 'text-blue-500' : 'text-gray-500']"
        >
          <span v-if="tradeType === TradeExecutionType.LimitFill">
            {{ $t('trade.limit') }}
          </span>

          <span v-if="tradeType === TradeExecutionType.Market">
            {{ $t('trade.market') }}
          </span>
        </span>
      </template>
    </AppSelectButton>

    <div v-if="!isSpot" class="flex items-center justify-start">
      <AppSelect
        v-model="tradingType"
        wrapper-class="h-6"
        :options="dropdownOptions"
        @update:model-value="resetForm"
      >
        <template #default="{ selected }">
          <div class="text-xs uppercase tracking-wide cursor-pointer">
            <span v-if="selected" class="text-blue-500">
              {{ selected.display }}
            </span>
            <span v-else class="text-gray-500">
              {{ $t('trade.stopLimit') }}
            </span>
          </div>
        </template>

        <template #option="{ option }">
          <span class="text-xs uppercase">
            {{ option.display }}
          </span>
        </template>
      </AppSelect>
    </div>
  </div>
</template>
