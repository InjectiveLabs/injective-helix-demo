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
    tpQuantity?: string
    position: PositionV2
    cancelTpStatus: Status
    takeProfitValue: string
    market: UiDerivativeMarket
    entryPrice: BigNumberInBase
    hasExistingTpOrder?: boolean
  }>(),
  { tpQuantity: '' }
)

const emit = defineEmits<{
  'tp:cancel': []
}>()

const hasNoTpQuantity = computed(() =>
  new BigNumberInBase(props.tpQuantity || 0).isZero()
)

const takeProfitPnl = computed(() => {
  const takeProfitPrice = new BigNumberInBase(props.takeProfitValue || 0)

  const takeProfitTotal = takeProfitPrice.times(props.tpQuantity || 0)
  const entryTotal = props.entryPrice.times(props.tpQuantity || 0)

  return props.isBuy
    ? takeProfitTotal.minus(entryTotal)
    : entryTotal.minus(takeProfitTotal)
})

const isCancelButtonDisabled = computed(
  () => props.status.isLoading() || !props.hasExistingTpOrder
)

function cancelTp() {
  emit('tp:cancel')
}
</script>

<template>
  <i18n-t
    tag="p"
    keypath="trade.takeProfitDetails"
    class="text-xs text-coolGray-400"
  >
    <template #price>
      <span class="inline-flex">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            showZeroAsEmDash: true,
            shouldAbbreviate: false,
            amount: takeProfitValue,
            decimals: market.priceDecimals
          }"
        />
      </span>
    </template>

    <template #quantity>
      <span class="inline-flex gap-1">
        <SharedAmount
          v-bind="{
            amount: tpQuantity,
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

        <span v-if="!takeProfitValue || hasNoTpQuantity"> &mdash; </span>
        <span
          v-else
          :class="[takeProfitPnl.gte(0) ? 'text-green-500' : 'text-red-500']"
          class="font-bold inline-flex gap-1"
        >
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              decimals: market.priceDecimals,
              amount: takeProfitPnl.toFixed()
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
        status: cancelTpStatus,
        variant: 'primary-outline',
        disabled: isCancelButtonDisabled
      }"
      :class="[
        isCancelButtonDisabled ? '!border-coolGray-450' : '!border-blue-250'
      ]"
      @click="cancelTp"
    >
      <div
        class="flex gap-2 items-center font-medium"
        :class="[
          isCancelButtonDisabled ? 'text-coolGray-450' : 'text-blue-250'
        ]"
      >
        <UIcon :name="NuxtUiIcons.Trash3" class="size-5" />
        <p>{{ $t('trade.cancelTakeProfit') }}</p>
      </div>
    </AppButton>
  </div>
</template>
