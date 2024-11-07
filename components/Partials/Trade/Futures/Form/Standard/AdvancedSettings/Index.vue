<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  DerivativesTradeFormField,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  PerpetualMarketCyTags
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
      :data-cy="dataCyTag(PerpetualMarketCyTags.AdvancedSettings)"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">
        {{ $t('trade.advancedSettings') }}
      </p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
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

        <PartialsTradeFuturesFormStandardAdvancedSettingsBypassWarning
          v-if="
            [
              DerivativeTradeTypes.Limit,
              DerivativeTradeTypes.StopLimit
            ].includes(
              derivativeFormValues[
                DerivativesTradeFormField.Type
              ] as DerivativeTradeTypes
            )
          "
        />

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

        <PartialsTradeFuturesFormStandardAdvancedSettingsTpSl
          v-if="
            [DerivativeTradeTypes.Market].includes(
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
