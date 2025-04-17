<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { SpotMarketCyTags } from '@/types'

const jsonStore = useSharedJsonStore()

const isOpen = ref(false)

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
        isOpen: jsonStore.isPostUpgradeMode ? true : isOpen
      }"
    >
      <div class="space-y-2 py-2">
        <PartialsTradeSpotFormStandardAdvancedSettingsPostOnly />

        <p
          v-if="jsonStore.isPostUpgradeMode"
          class="text-orange-500 text-xs ml-1"
        >
          {{ $t('trade.postOnlyWarning') }}
        </p>

        <PartialsTradeSpotFormStandardAdvancedSettingsBypassWarning />
      </div>
    </AppCollapse>
  </div>
</template>
