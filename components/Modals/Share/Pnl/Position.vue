<script lang="ts" setup>
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { Modal } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    position: PositionV2
  }>(),
  {}
)

const emit = defineEmits<{
  'on:close': []
}>()

const { pnl, price, market, markPrice, percentagePnl, effectiveLeverage } =
  useDerivativePosition(computed(() => props.position))

const priceDecimals = computed(
  () => market.value?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS
)

function onClose() {
  emit('on:close')
}
</script>

<template>
  <ModalsSharePnlBase
    v-bind="{
      modal: Modal.SharePositionPnl,
      filenamePrefix: 'Position-PNL'
    }"
    @on:close="onClose"
  >
    <template #canvas="{ isDownloading, selectedCharacter }">
      <ModalsSharePnlCanvasContent
        v-if="market"
        v-bind="{
          leverage: effectiveLeverage,
          isLoading: isDownloading,
          selectedCharacter: selectedCharacter,
          isLong: position.direction === TradeDirection.Long
        }"
      >
        <template #icon>
          <CommonTokenIcon
            class="size-5 min-w-5"
            v-bind="{ token: market.baseToken }"
          />
        </template>

        <template #ticker>{{ position.ticker }}</template>

        <template #performance>
          <span
            :class="{
              'text-red-500': pnl.lt(0),
              'text-green-500': pnl.gte(0)
            }"
          >
            {{ (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2) }}%
          </span>
        </template>

        <template #performanceLabel>{{ $t('common.pnl') }}</template>

        <template #entryPrice>
          <SharedAmount
            v-bind="{
              amount: price,
              shouldAbbreviate: false,
              noTrailingZeros: price.lt(1),
              decimals: price.gte(1)
                ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
                : priceDecimals
            }"
          />
        </template>

        <template #markPrice>
          <SharedAmount
            v-bind="{
              amount: markPrice,
              shouldAbbreviate: false,
              noTrailingZeros: markPrice.lt(1),
              decimals: markPrice.gte(1)
                ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
                : priceDecimals
            }"
          />
        </template>
      </ModalsSharePnlCanvasContent>
    </template>
  </ModalsSharePnlBase>
</template>
