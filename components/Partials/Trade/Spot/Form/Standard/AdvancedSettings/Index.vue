<script setup lang="ts">
import { SpotTradeForm, SpotTradeFormField, TradeTypes } from '@/types'

const spotFormValues = useFormValues<SpotTradeForm>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center cursor-pointer py-2"
      :data-cy="dataCyTag('advanced-settings')"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">Advanced Settings</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <SharedIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="space-y-2 py-2">
        <PartialsTradeSpotFormStandardAdvancedSettingsPostOnly
          v-if="spotFormValues[SpotTradeFormField.Type] === TradeTypes.Limit"
        />

        <PartialsTradeSpotFormStandardAdvancedSettingsBypassWarning
          v-if="spotFormValues[SpotTradeFormField.Type] === TradeTypes.Limit"
        />

        <PartialsTradeSpotFormStandardAdvancedSettingsSlippage
          v-if="spotFormValues[SpotTradeFormField.Type] === TradeTypes.Market"
        />
      </div>
    </AppCollapse>
  </div>
</template>
