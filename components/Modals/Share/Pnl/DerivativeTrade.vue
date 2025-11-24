<script lang="ts" setup>
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { Modal } from '@/types'
import type { SharedUiDerivativeTrade } from '@shared/types'

const props = withDefaults(
  defineProps<{
    trade: SharedUiDerivativeTrade
  }>(),
  {}
)

const emit = defineEmits<{
  'on:close': []
}>()

const { price, market, entryPrice, percentagePnl } = useTrade(
  computed(() => props.trade)
)

const isClosedLongPosition = computed(
  () => props.trade.tradeDirection === TradeDirection.Sell
)

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
      modal: Modal.ShareTradePnl,
      filenamePrefix: 'Trade-PNL'
    }"
    @on:close="onClose"
  >
    <template #canvas="{ isDownloading, selectedCharacter }">
      <ModalsSharePnlCanvasContent
        v-if="market"
        v-bind="{
          selectedCharacter,
          isLoading: isDownloading,
          isLong: isClosedLongPosition
        }"
      >
        <template #icon>
          <CommonTokenIcon
            class="size-5 min-w-5"
            v-bind="{ token: market.baseToken }"
          />
        </template>

        <template #ticker>{{ market.ticker }}</template>

        <template #performance>
          <span :class="getColorClassForChange(percentagePnl)">
            {{ (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2) }}%
          </span>
        </template>

        <template #performanceLabel>{{ $t('common.pnl') }}</template>

        <template #entryPrice>
          <SharedAmount
            v-bind="{
              amount: entryPrice,
              shouldAbbreviate: false,
              noTrailingZeros: entryPrice.lt(1),
              decimals: entryPrice.gte(1)
                ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
                : priceDecimals
            }"
          />
        </template>

        <template #exitPrice>
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
      </ModalsSharePnlCanvasContent>
    </template>
  </ModalsSharePnlBase>
</template>
