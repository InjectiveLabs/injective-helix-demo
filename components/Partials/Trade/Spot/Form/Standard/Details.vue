<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  MarketKey,
  TradeTypes,
  SpotTradeForm,
  SpotTradeFormField
} from '@/types'

const props = defineProps({
  total: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  quantity: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  feeAmount: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  worstPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  totalWithFee: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  feePercentage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  slippagePercentage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})
const spotMarket = inject(MarketKey)

const spotFormValues = useFormValues<SpotTradeForm>()

const isOpen = ref(true)

const { valueToString: totalToString } = useSharedBigNumberFormatter(
  computed(() => props.totalWithFee),
  { decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS }
)

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  computed(() => props.quantity),
  {
    decimalPlaces: spotMarket?.value?.quantityDecimals
  }
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div v-if="spotMarket" class="mb-4">
    <div
      class="flex items-center justify-between cursor-pointer select-none"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">{{ $t('trade.details') }}</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <SharedIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4 space-y-2">
        <div class="flex items-center text-lg">
          <p class="text-gray-100">{{ $t('trade.total') }}</p>
          <div class="border-t flex-1 mx-2" />

          <p class="font-mono space-x-2">
            <span>&asymp;{{ totalToString }} </span>
            <span class="text-gray-400">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.amount') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ quantityToString }} </span>
            <span class="text-gray-400">
              {{ spotMarket.baseToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">
            {{ spotMarket.quoteToken.symbol }} {{ $t('trade.amount') }}
          </p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ total.toFormat(spotMarket.priceDecimals) }} </span>
            <span class="text-gray-400">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.price') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ worstPrice.toFormat(spotMarket.priceDecimals) }} </span>
            <span class="text-gray-400">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div
          v-if="spotFormValues[SpotTradeFormField.Type] !== TradeTypes.Limit"
          class="flex items-center text-xs font-medium"
        >
          <p class="text-gray-400">{{ $t('trade.maker_taker_rate') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p v-if="spotMarket" class="font-mono">
            {{ +spotMarket.makerFeeRate * 100 }}% /
            {{ +spotMarket.takerFeeRate * 100 }}%
          </p>
        </div>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-gray-400">{{ $t('trade.maker_rate') }}</p>
            <div class="border-t flex-1 mx-2" />
            <p v-if="spotMarket" class="font-mono">
              {{ +spotMarket.makerFeeRate * 100 }}%
            </p>
          </div>

          <div class="flex items-center text-xs font-medium">
            <p class="text-gray-400">{{ $t('trade.estFeeRebate') }}</p>
            <div class="border-t flex-1 mx-2" />
            <p v-if="spotMarket" class="font-mono">
              {{ feeAmount.abs().toFixed(spotMarket.priceDecimals) }} USDT
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>
  </div>
</template>
