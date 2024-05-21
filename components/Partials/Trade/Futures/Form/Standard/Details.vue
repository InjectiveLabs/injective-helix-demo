<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { UiDerivativeMarket, derivativeMarketKey } from '~/types'

const derivativeMarket = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const props = defineProps({
  margin: {
    type: BigNumberInBase,
    required: true
  },

  totalNotional: {
    type: BigNumberInBase,
    required: true
  },

  worstPrice: {
    type: BigNumberInBase,
    required: true
  },

  feeAmount: {
    type: BigNumberInBase,
    required: true
  },

  marginWithFee: {
    type: BigNumberInBase,
    required: true
  },

  quantity: {
    type: BigNumberInBase,
    required: true
  }
})

const isOpen = ref(true)

const { valueToString: totalToString } = useBigNumberFormatter(
  computed(() => props.marginWithFee),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const { valueToString: marginToString } = useBigNumberFormatter(
  computed(() => props.margin),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const { valueToString: quantityToString } = useBigNumberFormatter(
  computed(() => props.quantity),
  { decimalPlaces: 4 }
)

const { valueToString: worstPriceToString } = useBigNumberFormatter(
  computed(() => props.worstPrice),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const { valueToString: feeAmountToString } = useBigNumberFormatter(
  computed(() => props.feeAmount),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div v-if="derivativeMarket" class="mb-4">
    <div
      class="flex items-center justify-between cursor-pointer select-none"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">Details</p>
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
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.quantity') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ quantityToString }} </span>
            <span class="text-gray-400">
              {{ derivativeMarket.baseToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">
            {{ $t('trade.notional') }}
          </p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ worstPriceToString }} </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.fee') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ feeAmountToString }} </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.margin') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ marginToString }} </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <!-- <div
          v-if="!isLimitAndPostOnly"
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
        </template> -->
      </div>
    </AppCollapse>
  </div>
</template>
