<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { DerivativesTradeForm } from '@/types'

const jsonStore = useSharedJsonStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const isOpen = ref(false)

const isLimit = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
    DerivativeTradeTypes.Limit
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="mb-2">
    <div
      class="flex justify-between items-center cursor-pointer"
      :data-cy="dataCyTag(PerpetualMarketCyTags.AdvancedSettings)"
      @click="toggle"
    >
      <p class="text-xs font-semibold select-none text-white">
        {{ $t('trade.advancedSettings') }}
      </p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </div>
    </div>

    <AppCollapse
      v-bind="{
        isOpen: isLimit && jsonStore.isPostUpgradeMode ? true : isOpen
      }"
    >
      <div class="py-2">
        <PartialsTradeFuturesFormStandardAdvancedSettingsPostOnly
          v-if="isLimit"
        />

        <p
          v-if="isLimit && jsonStore.isPostUpgradeMode"
          class="text-orange-500 text-xs ml-1"
        >
          {{ $t('trade.postOnlyWarning') }}
        </p>

        <PartialsTradeFuturesFormStandardAdvancedSettingsReduceOnly />

        <PartialsTradeFuturesFormStandardAdvancedSettingsBypassWarning
          v-if="
            [
              DerivativeTradeTypes.Limit,
              DerivativeTradeTypes.StopLimit
            ].includes(
              derivativeFormValues[
                DerivativesTradeFormField.Type
              ] as DerivativeTradeTypes
            )
          "
        />

        <PartialsTradeFuturesFormStandardAdvancedSettingsSlippage
          v-if="
            [
              DerivativeTradeTypes.Market,
              DerivativeTradeTypes.StopMarket
            ].includes(
              derivativeFormValues[
                DerivativesTradeFormField.Type
              ] as DerivativeTradeTypes
            )
          "
        />

        <PartialsTradeFuturesFormStandardAdvancedSettingsTpSl
          v-if="
            [DerivativeTradeTypes.Market].includes(
              derivativeFormValues[
                DerivativesTradeFormField.Type
              ] as DerivativeTradeTypes
            )
          "
        />
      </div>
    </AppCollapse>
  </div>
</template>
