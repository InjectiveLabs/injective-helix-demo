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
  <div>
    <div
      class="flex justify-between items-center cursor-pointer py-2"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">Advanced Settings</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <BaseIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="space-y-2 py-2">
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
