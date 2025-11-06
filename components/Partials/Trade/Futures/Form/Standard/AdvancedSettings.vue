<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

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

    <PartialsTradeFuturesFormStandardSettingsTpSl
      v-if="isMarketOrder"
      v-bind="{ estLiquidationPrice }"
      @tpsl:add="addTpSl"
    />
  </PartialsTradeCommonFormAdvancedSettings>
</template>
