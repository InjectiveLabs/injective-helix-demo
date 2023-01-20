<script lang="ts" setup>
import { PropType } from 'vue'
import { TradeDirection } from '@injectivelabs/ts-types'
import { getTokenLogoWithVendorPathPrefix } from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
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
  (e: 'showTradeDetails', state: UiTrade): void
}>()

const { time, price, market, quantity, tradeExecutionType } = useTrade(
  computed(() => props.trade),
  computed(() => props.isSpot)
)

const marketRoute = computed(() => {
  if (!market.value) {
    return { name: 'markets' }
  }

  const marketRoute = getMarketRoute(market.value)

  return marketRoute || { name: 'markets' }
})

const baseTokenLogo = computed(() => {
  if (!market.value) {
    return ''
  }

  if (!market.value.baseToken) {
    return ''
  }

  return getTokenLogoWithVendorPathPrefix(market.value.baseToken.logo)
})

function handleShowTradeDetails() {
  emit('showTradeDetails', props.trade)
}
</script>

<template>
  <CommonTableRow v-if="market" dense @click="handleShowTradeDetails">
    <div
      class="flex items-center justify-between col-span-2 text-xs leading-5 pb-1"
    >
      <NuxtLink class="flex items-center gap-1" :to="marketRoute">
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
        <div v-if="baseTokenLogo" class="w-4 h-4">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
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
      <AppNumber
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="price"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.amount') }}
    </span>
    <div class="text-right">
      <AppNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.time') }}
    </span>
    <span class="text-right text-xs font-mono tracking-wide">
      {{ time }}
    </span>
  </CommonTableRow>
</template>
