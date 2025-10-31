<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { DerivativesTradeForm } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { BigNumberInBase } from '@injectivelabs/utils'

const jsonStore = useSharedJsonStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const emit = defineEmits<{
  'tpsl:add': [position: PositionV2]
}>()

withDefaults(
  defineProps<{
    isLimitOrder: boolean
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const isOpen = ref(false)

const isMarketOrder = computed(() =>
  [DerivativeTradeTypes.Market].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )
)

function toggle() {
  isOpen.value = !isOpen.value
}

function addTpSl(position: PositionV2) {
  emit('tpsl:add', position)
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
        isOpen: isLimitOrder && jsonStore.isPostUpgradeMode ? true : isOpen
      }"
    >
      <div class="py-2">
        <PartialsTradeFuturesFormStandardAdvancedSettingsPostOnly
          v-if="isLimitOrder"
        />

        <p
          v-if="isLimitOrder && jsonStore.isPostUpgradeMode"
          class="text-orange-500 text-xs ml-1"
        >
          {{ $t('trade.postOnlyWarning') }}
        </p>

        <PartialsTradeFuturesFormStandardAdvancedSettingsReduceOnly />

        <PartialsTradeFuturesFormStandardAdvancedSettingsBypassWarning
          v-if="isLimitOrder"
        />

        <PartialsTradeFuturesFormStandardAdvancedSettingsTpSl
          v-if="isMarketOrder"
          v-bind="{ estLiquidationPrice }"
          @tpsl:add="addTpSl"
        />
      </div>
    </AppCollapse>
  </div>
</template>
