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
  <div>
    <PartialsTradeSpotFormTradingBotsAutoParams v-bind="$attrs" />
    <PartialsTradeSpotFormTradingBotsCommonInvestmentFields
      is-auto
      :is-disabled="hasActiveStrategy"
    />

    <div class="pb-4 mt-4">
      <PartialsTradeSpotFormTradingBotsCommonCreateStrategy
        v-if="!hasActiveStrategy"
        is-auto
      />

      <AppButton v-else class="w-full" @click="onViewDetails">
        {{ $t('sgt.viewDetails') }}
      </AppButton>
    </div>
  </div>
</template>
