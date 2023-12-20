<script lang="ts" setup>
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { Modal, UiTrade } from '@/types'

const modalStore = useModalStore()

const props = defineProps({
  isSpot: Boolean,

  trade: {
    type: Object as PropType<UiTrade>,
    default: undefined
  }
})

const isModalOpen = computed(
  () => modalStore.modals[Modal.MobileTradeDetails] && !!props.trade
)

const { fee, time, price, total, market, quantity, tradeExecutionType } =
  useTradeWithUndefined(
    computed(() => props.trade),
    computed(() => props.isSpot)
  )

function closeModal() {
  modalStore.closeModal(Modal.MobileTradeDetails)
}

function onModalClose() {
  closeModal()
}
</script>

<template>
  <AppModal
    v-if="trade && market"
    :is-open="isModalOpen"
    is-sm
    @modal:closed="onModalClose"
  >
    <template #title>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 cursor-pointer" @click="closeModal">
          <BaseIcon name="arrow" class="w-6 h-auto" />
          <span class="font-bold text-lg">
            {{ $t('trade.tradeHistoryDetails') }}
          </span>
        </div>
      </div>
    </template>

    <div class="bg-gray-900 px-3 py-4 grid grid-cols-2 gap-4 text-sm">
      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.time') }}
        </span>
        <AppTooltip class="ml-2" :content="$t('trade.timestamp_tooltip')" />
      </div>
      <span class="text-right font-mono tracking-wide">
        {{ time }}
      </span>

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.pair') }}
      </span>
      <div class="flex items-center justify-end">
        <CommonTokenIcon
          v-if="market.baseToken"
          :token="market.baseToken"
          is-sm
        />
        <span class="font-semibold uppercase ml-1">
          {{ market.ticker }}
        </span>
      </div>

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.type') }}
      </span>
      <span class="font-semibold text-right">{{ tradeExecutionType }}</span>

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.side') }}
      </span>
      <span
        class="font-semibold text-right"
        :class="{
          'text-green-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{
          $t(
            `trade.${
              trade.tradeDirection === TradeDirection.Buy ? 'buy' : 'sell'
            }`
          )
        }}
      </span>

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.price') }}
      </span>
      <span v-if="price" class="text-right">
        <AppNumber
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="price"
        />
      </span>

      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.amount') }}
        </span>
        <AppTooltip class="ml-2" :content="$t('trade.amount_tooltip')" />
      </div>
      <span v-if="quantity" class="text-right">
        <AppNumber
          :decimals="
            market
              ? market.quantityDecimals
              : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
          "
          :number="quantity"
        />
      </span>

      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.fee') }}
        </span>
        <AppTooltip class="ml-2" :content="$t('trade.fees_tooltip')" />
      </div>
      <span v-if="fee" class="text-right">
        <AppNumber use-number-decimals :number="fee">
          <template #addon>
            <span class="text-2xs text-gray-500">
              {{ market.quoteToken.symbol }}
            </span>
          </template>
        </AppNumber>
      </span>

      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.total') }}
        </span>
        <AppTooltip class="ml-2" :content="$t('trade.fees_tooltip')" />
      </div>
      <span v-if="total" class="text-right">
        <AppNumber
          data-cy="trade-history-total-table-data"
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="total"
        >
          <template #addon>
            <span class="text-2xs text-gray-500">
              {{ market.quoteToken.symbol }}
            </span>
          </template>
        </AppNumber>
      </span>
    </div>
  </AppModal>
</template>
