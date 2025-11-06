<script setup lang="ts">
import { SpotTradeFormField } from '@/types'

const jsonStore = useSharedJsonStore()
</script>

<template>
  <PartialsTradeCommonFormAdvancedSettings
    v-bind="{
      forceOpen: jsonStore.isPostUpgradeMode
    }"
  >
    <PartialsTradeCommonFormSettingsPostOnly
      :formFieldName="SpotTradeFormField.PostOnly"
    />

    <p v-if="jsonStore.isPostUpgradeMode" class="text-orange-500 text-xs ml-1">
      {{ $t('trade.postOnlyWarning') }}
    </p>

    <PartialsTradeCommonFormSettingsBypassWarning
      :formFieldName="SpotTradeFormField.BypassPriceWarning"
    />
  </PartialsTradeCommonFormAdvancedSettings>
</template>
