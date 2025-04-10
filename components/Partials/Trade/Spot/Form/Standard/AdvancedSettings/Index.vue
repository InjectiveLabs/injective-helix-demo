<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { TradeTypes, SpotMarketCyTags, SpotTradeFormField } from '@/types'
import type { SpotTradeForm } from '@/types'

const jsonStore = useSharedJsonStore()
const spotFormValues = useFormValues<SpotTradeForm>()

const isOpen = ref(false)

const isLimit = computed(
  () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center cursor-pointer"
      :data-cy="dataCyTag(SpotMarketCyTags.AdvancedSettings)"
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
      <div class="space-y-2 py-2">
        <PartialsTradeSpotFormStandardAdvancedSettingsPostOnly v-if="isLimit" />

        <p
          v-if="isLimit && jsonStore.isPostUpgradeMode"
          class="text-orange-500 text-xs ml-1"
        >
          {{ $t('trade.postOnlyWarning') }}
        </p>

        <PartialsTradeSpotFormStandardAdvancedSettingsBypassWarning
          v-if="isLimit"
        />

        <PartialsTradeSpotFormStandardAdvancedSettingsSlippage
          v-if="!isLimit"
        />
      </div>
    </AppCollapse>
  </div>
</template>
