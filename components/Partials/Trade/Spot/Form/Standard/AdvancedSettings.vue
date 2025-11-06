<script setup lang="ts">
import { SpotMarketCyTags, SpotTradeFormField } from '@/types'

const jsonStore = useSharedJsonStore()
</script>

<template>
  <PartialsTradeCommonFormAdvancedSettings
    v-bind="{
      forceOpen: jsonStore.isPostUpgradeMode,
      cyTag: SpotMarketCyTags.AdvancedSettings
    }"
  >
    <PartialsTradeCommonFormSettingsPostOnly
      v-bind="{
        formFieldName: SpotTradeFormField.PostOnly,
        cyTag: SpotMarketCyTags.AdvancedSettingsPostOnly
      }"
    />

    <p v-if="jsonStore.isPostUpgradeMode" class="text-orange-500 text-xs ml-1">
      {{ $t('trade.postOnlyWarning') }}
    </p>

    <PartialsTradeCommonFormSettingsBypassWarning
      v-bind="{
        formFieldName: SpotTradeFormField.BypassPriceWarning,
        cyTag: SpotMarketCyTags.AdvancedSettingsBypassWarning
      }"
    />
  </PartialsTradeCommonFormAdvancedSettings>
</template>
