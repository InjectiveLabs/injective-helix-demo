<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { SpotTradeForm, spotMarketKey } from '~/types'

const props = defineProps({
  hasEnoughLiquidity: Boolean,

  totalWorstPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  totalWorstPriceWithSlippageAndFees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const spotMarket = inject(spotMarketKey)

const spotFormValues = useFormValues<SpotTradeForm>()

const { valueToString: totalToString } = useBigNumberFormatter(
  computed(() => props.totalWorstPriceWithSlippageAndFees)
)

const { valueToString: quantityToString } = useBigNumberFormatter(
  computed(() => new BigNumberInBase(spotFormValues.value.quantity || 0))
)

const isOpen = ref(false)

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
      <p class="text-sm font-semibold select-none">Details</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <BaseIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4 space-y-2">
        <div class="flex items-center text-lg">
          <p class="text-gray-400">{{ $t('trade.total') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span>{{ totalToString }} </span>
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
          <p class="text-gray-400">{{ $t('trade.maker_taker_rate') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p v-if="spotMarket" class="font-mono">
            {{ +spotMarket.makerFeeRate * 100 }}% /
            {{ +spotMarket.takerFeeRate * 100 }}%
          </p>
        </div>
      </div>
    </AppCollapse>
  </div>
</template>
