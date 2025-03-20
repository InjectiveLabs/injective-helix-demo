<script setup lang="ts">
withDefaults(
  defineProps<{
    hasActiveStrategy: boolean
  }>(),
  { hasActiveStrategy: false }
)

const emit = defineEmits<{
  'view:details': []
}>()

function onViewDetails() {
  emit('view:details')
}
</script>

<template>
  <div class="pt-4">
    <PartialsTradeSpotFormTradingBotsManualPriceRangeFields
      v-bind="{ isDisabled: hasActiveStrategy }"
    />
    <PartialsTradeSpotFormTradingBotsManualGridsField
      v-bind="{ isDisabled: hasActiveStrategy }"
    />
    <PartialsTradeSpotFormTradingBotsCommonInvestmentFields
      v-bind="{ isDisabled: hasActiveStrategy }"
    />

    <PartialsTradeSpotFormTradingBotsManualAdvancedSettings />

    <div class="py-4">
      <PartialsTradeSpotFormTradingBotsCommonCreateStrategy
        v-if="!hasActiveStrategy"
      />

      <AppButton v-else class="w-full" @click="onViewDetails">
        {{ $t('sgt.viewDetails') }}
      </AppButton>
    </div>
  </div>
</template>
