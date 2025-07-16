<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { TradePage, BusEvents, TradeSubPage } from '@/types'
import type { UiDerivativeMarket } from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'

const route = useRoute()
const router = useRouter()
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

async function onViewOrder() {
  if (route.name !== TradeSubPage.Futures) {
    router.push({ name: TradePage.Futures })
  }

  setTimeout(() => {
    useEventBus(BusEvents.GoToPerpOrdersView).emit()
  }, 200)
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
          {{ $t('trade.viewOrder') }}
        </span>
      </div>
    </template>
  </UPopover>
</template>
