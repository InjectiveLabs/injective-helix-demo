<script setup lang="ts">
import {
  BusEvents,
  IsSpotKey,
  SpotMarketCyTags,
  PerpetualMarketCyTags
} from '@/types'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'

const props = withDefaults(
  defineProps<{
    isLimitOrder?: boolean
  }>(),
  {}
)

const isSpot = inject(IsSpotKey)

const side = defineModel<string>({ required: true })

const sides = computed(() =>
  isSpot
    ? [OrderSide.Buy, OrderSide.Sell]
    : [TradeDirection.Long, TradeDirection.Short]
)

function onOrderSideClicked() {
  if (props.isLimitOrder) {
    useEventBus(BusEvents.OrderSideToggled).emit()
  }
}
</script>

<template>
  <div class="flex rounded-md bg-brand-875">
    <AppButtonSelect
      v-for="option in sides"
      :key="option"
      class="flex-1"
      v-model="side"
      v-bind="{ value: option }"
      :data-cy="`${dataCyTag(
        isSpot
          ? SpotMarketCyTags.SpotTradingSide
          : PerpetualMarketCyTags.TradeDirection
      )}-${option}`"
      @click="onOrderSideClicked"
    >
      <AppButton
        class="w-full py-2 leading-relaxed focus-within:ring-0"
        :variant="
          option === side
            ? option === sides[0]
              ? 'success'
              : 'danger'
            : option === sides[0]
              ? 'success-cta'
              : 'danger-cta'
        "
      >
        <template v-if="isSpot">
          {{ $t(`trade.${option}`) }}
        </template>
        <template v-else>
          <span>
            {{ $t(`trade.${option === TradeDirection.Long ? 'buy' : 'sell'}`) }}
            /
            {{
              $t(`trade.${option === TradeDirection.Long ? 'long' : 'short'}`)
            }}
          </span>
        </template>
      </AppButton>
    </AppButtonSelect>
  </div>
</template>
