<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import type { UiDerivativeMarket } from '@/types'
import type { Status } from '@injectivelabs/utils'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    isBuy: boolean
    status: Status
    slQuantity?: string
    position: PositionV2
    stopLossValue: string
    cancelSlStatus: Status
    market: UiDerivativeMarket
    entryPrice: BigNumberInBase
    hasExistingSlOrder?: boolean
  }>(),
  { slQuantity: '' }
)

const emit = defineEmits<{
  'sl:cancel': []
}>()

const hasNoSlQuantity = computed(() =>
  new BigNumberInBase(props.slQuantity || 0).isZero()
)

const stopLossPnl = computed(() => {
  const stopLossPrice = new BigNumberInBase(props.stopLossValue || 0)

  const stopLossTotal = stopLossPrice.times(props.slQuantity || 0)
  const entryTotal = props.entryPrice.times(props.slQuantity || 0)

  return props.isBuy
    ? stopLossTotal.minus(entryTotal)
    : entryTotal.minus(stopLossTotal)
})

const isCancelButtonDisabled = computed(
  () => props.status.isLoading() || !props.hasExistingSlOrder
)

function cancelSl() {
  emit('sl:cancel')
}
</script>

<template>
  <i18n-t
    tag="p"
    keypath="trade.stopLossDetails"
    class="text-xs text-coolGray-400"
  >
    <template #price>
      <span class="inline-flex">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            amount: stopLossValue,
            showZeroAsEmDash: true,
            shouldAbbreviate: false,
            decimals: market.priceDecimals
          }"
        />
      </span>
    </template>

    <template #quantity>
      <span class="inline-flex gap-1">
        <SharedAmount
          v-bind="{
            amount: slQuantity,
            useSubscript: true,
            shouldAbbreviate: false,
            decimals: market.quantityDecimals
          }"
        />
        <span>{{ market.baseToken.symbol }}</span>
      </span>
    </template>
  </i18n-t>

  <div class="flex justify-between items-center flex-wrap gap-4 max-sm:gap-2">
    <div>
      <p class="text-xs">
        <span>{{ $t('trade.profitLoss') }}: </span>

        <span v-if="!stopLossValue || hasNoSlQuantity"> &mdash; </span>
        <span
          v-else
          :class="[stopLossPnl.gte(0) ? 'text-green-500' : 'text-red-500']"
          class="font-bold inline-flex gap-1"
        >
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: stopLossPnl.toFixed(),
              decimals: market.priceDecimals
            }"
          />
          <span>{{ market.quoteToken.symbol }}</span>
        </span>
      </p>
    </div>

    <AppButton
      class="w-40 py-1.5"
      v-bind="{
        size: 'sm',
        status: cancelSlStatus,
        variant: 'primary-outline',
        disabled: isCancelButtonDisabled
      }"
      :class="[
        isCancelButtonDisabled ? '!border-coolGray-450' : '!border-blue-250'
      ]"
      @click="cancelSl"
    >
      <div
        class="flex gap-2 items-center font-medium"
        :class="[
          isCancelButtonDisabled ? 'text-coolGray-450' : 'text-blue-250'
        ]"
      >
        <UIcon :name="NuxtUiIcons.Trash3" class="size-5" />
        <p>{{ $t('trade.cancelStopLoss') }}</p>
      </div>
    </AppButton>
  </div>
</template>
