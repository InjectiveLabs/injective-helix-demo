<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'
import {
  UiSpotLimitOrder,
  UiDerivativeLimitOrder
} from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { getMarketRoute } from '@/app/utils/market'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

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
  priceDecimals,
  filledQuantity,
  quantityDecimals
} = useOrder(
  computed(() => props.order),
  computed(() => props.isSpot)
)

const marketRoute = computed(() => {
  if (!market.value) {
    return undefined
  }

  return getMarketRoute(market.value)
})

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
</script>

<template>
  <CommonTableRow v-if="market" is-dense>
    <NuxtLink class="pb-1 col-span-2" :to="marketRoute">
      <div class="flex items-center justify-between text-xs leading-5">
        <div class="flex items-center gap-1">
          <span
            :class="{
              'text-green-500': order.orderSide === OrderSide.Buy,
              'text-red-500': order.orderSide === OrderSide.Sell
            }"
          >
            {{
              order.orderSide === OrderSide.Buy
                ? $t('trade.buy')
                : $t('trade.sell')
            }}
          </span>
          <div v-if="market.baseToken">
            <CommonTokenIcon :token="market.baseToken" is-md />
          </div>
          <span class="text-gray-200 font-semibold">
            {{ market.ticker }}
          </span>

          <span v-if="leverage.gte(0)" class="font-mono">
            {{ leverage.toFormat(2) }}x
          </span>
        </div>

        <PartialsCommonCancelButton
          v-if="orderFillable"
          :status="status"
          is-sm
          @click="onCancelOrder"
        />
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
      <AppNumber :decimals="priceDecimals" :number="price" />
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
