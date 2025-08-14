<script setup lang="ts">
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'
import { PerpetualMarketCyTags } from '@/types'

const appStore = useAppStore()
const jsonStore = useSharedJsonStore()

const props = withDefaults(defineProps<{ position: PositionV2 }>(), {})

const emit = defineEmits<{
  'tpsl:add': [position: PositionV2]
}>()

function addTpSl() {
  emit('tpsl:add', props.position)
}
</script>

<template>
  <AppTooltip
    :ui="{ width: 'w-auto' }"
    :content="$t('trade.postOnlyWarning')"
    :is-disabled="!jsonStore.isPostUpgradeMode"
  >
    <button
      :data-cy="dataCyTag(PerpetualMarketCyTags.PositionsTableAddTpSlButton)"
      class="flex p-2 focus-visible:outline-none"
      :disabled="appStore.isCountryRestricted || jsonStore.isPostUpgradeMode"
      @click="addTpSl"
    >
      <div
        class="flex rounded-full transition"
        :class="{
          'hover:bg-coolGray-600': !appStore.isCountryRestricted
        }"
      >
        <UIcon
          class="h-6 w-6 min-w-6"
          :name="NuxtUiIcons.CirclePlus"
          :class="{
            'text-coolGray-700':
              appStore.isCountryRestricted || jsonStore.isPostUpgradeMode
          }"
        />
      </div>
    </button>
  </AppTooltip>
</template>
