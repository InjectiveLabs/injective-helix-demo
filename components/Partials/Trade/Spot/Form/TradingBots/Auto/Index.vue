<script setup lang="ts">
defineProps({
  hasActiveStrategy: Boolean
})

const emit = defineEmits<{
  'view:details': []
}>()

function onViewDetails() {
  emit('view:details')
}
</script>

<template>
  <div>
    <PartialsTradeSpotFormTradingBotsAutoParams v-bind="$attrs" />
    <PartialsTradeSpotFormTradingBotsCommonInvestmentFields
      is-auto
      :is-disabled="hasActiveStrategy"
    />

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
