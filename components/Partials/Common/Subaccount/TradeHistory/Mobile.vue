<script lang="ts" setup>
import { TradeDirection } from '@injectivelabs/ts-types'
import { getMarketRoute } from '@/app/utils/market'
import { UiTrade } from '@/types'

const props = defineProps({
  isSpot: Boolean,

  trade: {
    required: true,
    type: Object as PropType<UiTrade>
  }
})

const emit = defineEmits<{
  showTradeDetails: [state: UiTrade]
}>()

const {
  time,
  price,
  market,
  quantity,
  priceDecimals,
  quantityDecimals,
  tradeExecutionType
} = useTrade(
  computed(() => props.trade),
  computed(() => props.isSpot)
)

const marketRoute = computed(() => {
  if (!market.value) {
    return undefined
  }

  return getMarketRoute(market.value)
})

function showTradeDetails() {
  emit('showTradeDetails', props.trade)
}
</script>

<template>
  <CommonTableRow v-if="market" is-dense @click="showTradeDetails">
    <div
      class="flex items-center justify-between col-span-2 text-xs leading-5 pb-1"
    >
      <NuxtLink
        class="flex items-center gap-1 cursor-pointer"
        :to="marketRoute"
      >
        <span
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
        <div v-if="market.baseToken">
          <CommonTokenIcon :token="market.baseToken" is-sm />
        </div>
        <span class="text-gray-200 font-semibold">
          {{ market.ticker }}
        </span>
      </NuxtLink>

      <span>{{ tradeExecutionType }}</span>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.price') }}
    </span>
    <div class="text-right">
      <AppNumber :decimals="priceDecimals" :number="price" />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.amount') }}
    </span>
    <div class="text-right">
      <AppNumber :decimals="quantityDecimals" :number="quantity" />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.time') }}
    </span>
    <span class="text-right text-xs font-mono tracking-wide">
      {{ time }}
    </span>
  </CommonTableRow>
</template>
