<script setup lang="ts">
import { PerpetualMarketCyTags, DerivativesTradeFormField } from '@/types'

import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { BigNumberInBase } from '@injectivelabs/utils'

const jsonStore = useSharedJsonStore()

const emit = defineEmits<{
  'tpsl:add': [position: PositionV2]
}>()

withDefaults(
  defineProps<{
    isLimitOrder: boolean
    isMarketOrder: boolean
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

function addTpSl(position: PositionV2) {
  emit('tpsl:add', position)
}
</script>

<template>
  <PartialsTradeCommonFormAdvancedSettings
    v-bind="{
      cyTag: PerpetualMarketCyTags.AdvancedSettings,
      forceOpen: isLimitOrder && jsonStore.isPostUpgradeMode
    }"
  >
    <PartialsTradeCommonFormSettingsPostOnly
      v-if="isLimitOrder"
      v-bind="{
        formFieldName: DerivativesTradeFormField.PostOnly,
        cyTag: PerpetualMarketCyTags.AdvancedSettingsPostOnlyCheckbox
      }"
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
      v-bind="{
        formFieldName: DerivativesTradeFormField.BypassPriceWarning,
        cyTag: PerpetualMarketCyTags.AdvancedSettingsByPassPriceWarningCheckbox
      }"
    />

    <PartialsTradeFuturesFormStandardSettingsTpSl
      v-if="isMarketOrder"
      v-bind="{ estLiquidationPrice }"
      @tpsl:add="addTpSl"
    />
  </PartialsTradeCommonFormAdvancedSettings>
</template>
