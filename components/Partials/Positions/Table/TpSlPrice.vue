<script setup lang="ts">
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { BigNumberInBase } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'

const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    position: PositionV2
    priceDecimals: number
    isHideEditButton?: boolean
    tpTriggerPrice?: BigNumberInBase
    slTriggerPrice?: BigNumberInBase
  }>(),
  {
    tpTriggerPrice: undefined,
    slTriggerPrice: undefined
  }
)

const emit = defineEmits<{
  'tpsl:update': [position: PositionV2]
}>()

function editTpSl() {
  emit('tpsl:update', props.position)
}
</script>

<template>
  <AppTooltip
    :ui="{ width: 'w-auto' }"
    :content="$t('trade.postOnlyWarning')"
    :is-disabled="!jsonStore.isPostUpgradeMode"
  >
    <div class="flex items-center gap-2">
      <div class="text-xs font-mono flex flex-col items-end">
        <div class="flex items-center">
          <AppAmount
            v-if="tpTriggerPrice"
            v-bind="{
              amount: tpTriggerPrice.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
          <span v-else> &mdash; </span>

          <span class="text-coolGray-450">&nbsp;{{ $t('trade.tp') }}</span>
        </div>

        <div class="flex items-center">
          <AppAmount
            v-if="slTriggerPrice"
            v-bind="{
              amount: slTriggerPrice.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
          <span v-else> &mdash; </span>

          <span class="text-coolGray-450">&nbsp;{{ $t('trade.sl') }}</span>
        </div>
      </div>

      <UIcon
        v-if="!isHideEditButton"
        :name="NuxtUiIcons.Edit"
        class="size-5 transition-colors"
        :class="{ 'hover:text-coolGray-450': !jsonStore.isPostUpgradeMode }"
        @click="editTpSl"
      />
    </div>
  </AppTooltip>
</template>
