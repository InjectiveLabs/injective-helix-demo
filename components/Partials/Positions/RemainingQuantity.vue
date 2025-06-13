<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { BusEvents } from '../../../types/enums'
import type { BigNumberInBase } from '@injectivelabs/utils'
import type { UiDerivativeMarket } from '~/types'

const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    market: UiDerivativeMarket
    usedQuantity: BigNumberInBase
  }>(),
  {}
)

const { valueToString: usedQuantityToString } = useSharedBigNumberFormatter(
  computed(() => props.usedQuantity),
  {
    shouldTruncate: true,
    decimalPlaces: computed(() => props.market.quantityDecimals)
  }
)

const getUsedQuantity = computed(() => {
  return `${usedQuantityToString.value} ${props.market.baseToken.symbol}`
})

function onViewOrder() {
  useEventBus(BusEvents.GoToPerpOrdersView).emit()
}
</script>

<template>
  <UPopover :popper="{ placement: 'top' }" :mode="lg ? 'hover' : 'click'">
    <UIcon :name="NuxtUiIcons.Info3" class="size-4" />

    <template #panel>
      <div
        class="flex flex-col gap-2 text-xs text-coolGray-200 max-w-80 py-3 px-4 rounded-xl bg-[#1D2024] tracking-wide"
      >
        <p class="whitespace-normal">
          {{ $t('trade.positionUsedTooltip', { quantity: getUsedQuantity }) }}
        </p>

        <span
          class="text-blue-300 font-medium hover:opacity-70 transition-opacity cursor-pointer"
          @click="onViewOrder"
        >
          {{ $t('trade.view_order') }}
        </span>
      </div>
    </template>
  </UPopover>
</template>
