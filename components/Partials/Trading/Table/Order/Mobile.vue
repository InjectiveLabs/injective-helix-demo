<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import {
  UiSpotLimitOrder,
  UiDerivativeLimitOrder,
  DerivativeOrderSide
} from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { getMarketRoute } from '@/app/utils/market'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const router = useRouter()

const props = defineProps({
  isSpot: Boolean,

  order: {
    required: true,
    type: Object as PropType<UiSpotLimitOrder | UiDerivativeLimitOrder>
  }
})

const status = reactive(new Status())

const {
  price,
  total,
  market,
  quantity,
  leverage,
  isReduceOnly,
  orderFillable,
  filledQuantity
} = useOrder(
  computed(() => props.order),
  computed(() => props.isSpot)
)

function onCancelOrder() {
  status.setLoading()

  const action = props.isSpot
    ? () => spotStore.cancelOrder(props.order as UiSpotLimitOrder)
    : () => derivativeStore.cancelOrder(props.order as UiDerivativeLimitOrder)

  action()
    .then(() => {
      success({ title: t('trade.order_success_canceling') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleClickOnMarket() {
  if (!market.value) {
    return
  }

  return router.push(getMarketRoute(market.value))
}
</script>

<template>
  <CommonTableRow v-if="market" dense>
    <div class="pb-1 col-span-2" @click="handleClickOnMarket">
      <div class="flex items-center justify-between text-xs leading-5">
        <div class="flex items-center gap-1">
          <span
            :class="{
              'text-green-500': order.orderSide === DerivativeOrderSide.Buy,
              'text-red-500': order.orderSide === DerivativeOrderSide.Sell
            }"
          >
            {{
              order.orderSide === DerivativeOrderSide.Buy
                ? $t('trade.buy')
                : $t('trade.sell')
            }}
          </span>
          <div v-if="market.baseToken" class="w-4 h-4">
            <CommonTokenIcon :token="market.baseToken" sm />
          </div>
          <span class="text-gray-200 font-semibold">
            {{ market.ticker }}
          </span>

          <span v-if="leverage.gte(0)" class="font-mono">
            {{ leverage.toFormat(2) }}x
          </span>
        </div>

        <PartialsTradingFormCancelButton
          v-if="orderFillable"
          :status="status"
          sm
          @click="onCancelOrder"
        />
      </div>
      <div
        v-if="isReduceOnly"
        class="mt-0.5 text-gray-500 uppercase tracking-widest text-2xs"
      >
        {{ $t('trade.reduce_only') }}
      </div>
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
      {{ $t('trade.filled') }} / {{ $t('trade.amount') }}
    </span>
    <div class="flex items-center gap-1 justify-end">
      <AppNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="filledQuantity"
      />
      <span>/</span>
      <AppNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.total') }}
    </span>
    <div class="text-right">
      <AppNumber
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
    </div>
  </CommonTableRow>
</template>
