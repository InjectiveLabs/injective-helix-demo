<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { PerpetualMarketCyTags } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { BigNumberInBase } from '@injectivelabs/utils'

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
      <div class="text-xs flex flex-col items-end">
        <div class="flex items-center gap-1.5">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              hideDecimals: true,
              amount: tpTriggerPrice,
              showZeroAsEmDash: true,
              shouldAbbreviate: false
            }"
            :data-cy="dataCyTag(PerpetualMarketCyTags.PositionsTableTPValue)"
          />

          <span class="text-coolGray-450">{{ $t('trade.tp') }}</span>
        </div>

        <div class="flex items-center gap-1.5">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              hideDecimals: true,
              amount: slTriggerPrice,
              showZeroAsEmDash: true,
              shouldAbbreviate: false
            }"
            :data-cy="dataCyTag(PerpetualMarketCyTags.PositionsTableSLValue)"
          />

          <span class="text-coolGray-450">{{ $t('trade.sl') }}</span>
        </div>
      </div>

      <UIcon
        v-if="!isHideEditButton"
        :name="NuxtUiIcons.Edit"
        class="size-5 transition-colors"
        :class="{ 'hover:text-coolGray-450': !jsonStore.isPostUpgradeMode }"
        :data-cy="dataCyTag(PerpetualMarketCyTags.PositionsTableEditTpSlButton)"
        @click="editTpSl"
      />
    </div>
  </AppTooltip>
</template>
