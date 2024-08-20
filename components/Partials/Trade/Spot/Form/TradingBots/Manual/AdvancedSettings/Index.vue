<script setup lang="ts">
const isOpen = ref(true)

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
      <p class="text-sm font-semibold select-none">
        {{ $t('trade.advancedSettings') }}
      </p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <SharedIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="space-y-2 py-2">
        <PartialsTradeSpotFormTradingBotsManualAdvancedSettingsExitType />
        <PartialsTradeSpotFormTradingBotsManualAdvancedSettingsStrategyType />
        <PartialsTradeSpotFormTradingBotsManualAdvancedSettingsTpSl />
      </div>
    </AppCollapse>
  </div>
</template>
