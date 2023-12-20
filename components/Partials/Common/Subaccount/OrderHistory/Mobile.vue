<script lang="ts" setup>
import {
  UiSpotOrderHistory,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { getMarketRoute } from '@/app/utils/market'

const props = defineProps({
  isSpot: Boolean,

  order: {
    required: true,
    type: Object as PropType<UiSpotOrderHistory | UiDerivativeOrderHistory>
  }
})

const {
  isBuy,
  total,
  price,
  market,
  quantity,
  leverage,
  isReduceOnly,
  isMarketOrder,
  priceDecimals,
  filledQuantity,
  quantityDecimals
} = useOrderHistory(
  computed(() => props.order),
  computed(() => props.isSpot)
)

const marketRoute = computed(() => {
  if (!market.value) {
    return undefined
  }

  return getMarketRoute(market.value)
})
</script>

<template>
  <CommonTableRow v-if="market" is-dense>
    <NuxtLink class="pb-1 col-span-2" :to="marketRoute">
      <div class="flex items-center justify-between text-xs leading-5">
        <div class="flex items-center gap-1">
          <span
            :class="{
              'text-green-500': isBuy,
              'text-red-500': !isBuy
            }"
          >
            {{ isBuy ? $t('trade.buy') : $t('trade.sell') }}
          </span>
          <div v-if="market.baseToken" class="w-4 h-4">
            <CommonTokenIcon :token="market.baseToken" is-sm />
          </div>
          <span class="text-gray-200 font-semibold">
            {{ market.ticker }}
          </span>

          <span v-if="leverage.gte(0)" class="font-mono">
            {{ leverage.toFormat(2) }}x
          </span>
        </div>
      </div>
      <div
        v-if="isReduceOnly"
        class="mt-0.5 text-gray-500 uppercase tracking-widest text-2xs"
      >
        {{ $t('trade.reduce_only') }}
      </div>
    </NuxtLink>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.price') }}
    </span>
    <div class="text-right">
      <span v-if="isMarketOrder" class="text-white text-xs">
        {{ $t('trade.market') }}
      </span>

      <AppNumber v-else :decimals="priceDecimals" :number="price" />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.filled') }} / {{ $t('trade.amount') }}
    </span>
    <div class="flex items-center gap-1 justify-end">
      <AppNumber :decimals="quantityDecimals" :number="filledQuantity" />
      <span>/</span>
      <AppNumber :decimals="quantityDecimals" :number="quantity" />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.total') }}
    </span>
    <div class="text-right">
      <AppNumber :decimals="priceDecimals" :number="total">
        <template #addon>
          <span class="text-2xs text-gray-500">
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppNumber>
    </div>
  </CommonTableRow>
</template>
