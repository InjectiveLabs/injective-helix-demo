<script setup lang="ts">
import {
  DerivativesTradeFormField,
  DerivativeTradeTypes,
  DerivativesTradeForm
} from '@/types'

const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="mb-2">
    <div
      class="flex justify-between items-center cursor-pointer py-2"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">
        {{ $t('trade.advancedSettings') }}
      </p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <SharedIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-2">
        <PartialsTradeFuturesFormStandardAdvancedSettingsPostOnly
          v-if="
            derivativeFormValues[DerivativesTradeFormField.Type] ===
            DerivativeTradeTypes.Limit
          "
        />

        <PartialsTradeFuturesFormStandardAdvancedSettingsReduceOnly />

        <PartialsTradeFuturesFormStandardAdvancedSettingsSlippage
          v-if="
            [
              DerivativeTradeTypes.Market,
              DerivativeTradeTypes.StopMarket
            ].includes(
              derivativeFormValues[
                DerivativesTradeFormField.Type
              ] as DerivativeTradeTypes
            )
          "
        />
      </div>
    </AppCollapse>
  </div>
</template>
