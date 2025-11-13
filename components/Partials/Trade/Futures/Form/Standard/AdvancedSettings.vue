<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const jsonStore = useSharedJsonStore()

withDefaults(
  defineProps<{
    isLimitOrder?: boolean
    isMarketOrder?: boolean
  }>(),
  {}
)
</script>

<template>
  <PartialsTradeCommonFormAdvancedSettings
    v-bind="{
      forceOpen: isLimitOrder && jsonStore.isPostUpgradeMode
    }"
  >
    <PartialsTradeCommonFormSettingsPostOnly
      v-if="isLimitOrder"
      :formFieldName="DerivativesTradeFormField.PostOnly"
    />

    <p
      v-if="isLimitOrder && jsonStore.isPostUpgradeMode"
      class="text-orange-500 text-xs ml-1"
    >
      {{ $t('trade.postOnlyWarning') }}
    </p>

    <PartialsTradeFuturesFormStandardSettingsReduceOnly />

    <PartialsTradeCommonFormSettingsBypassWarning
      v-if="isLimitOrder"
      :formFieldName="DerivativesTradeFormField.BypassPriceWarning"
    />
  </PartialsTradeCommonFormAdvancedSettings>
</template>
