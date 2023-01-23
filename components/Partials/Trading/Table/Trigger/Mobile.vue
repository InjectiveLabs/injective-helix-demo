<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import {
  DerivativeOrderSide,
  ZERO_IN_BASE,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { DerivativeOrderState } from '@injectivelabs/sdk-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { getMarketRoute } from '@/app/utils/market'

const derivativeStore = useDerivativeStore()
const router = useRouter()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const props = defineProps({
  order: {
    required: true,
    type: Object as PropType<UiDerivativeOrderHistory>
  }
})

const status = reactive(new Status())

const markets = computed(() => {
  return derivativeStore.markets
})

const market = computed(() => {
  return markets.value.find((m) => m.marketId === props.order.marketId)
})

const isMarketOrder = computed(() => props.order.executionType === 'market')

const isReduceOnly = computed(() => {
  if (props.order.isReduceOnly) {
    return true
  }

  return margin.value.isZero()
})

const price = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.order.price).toBase(
    market.value.quoteToken.decimals
  )
})

const margin = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.order.margin).toBase(
    market.value.quoteToken.decimals
  )
})

const quantity = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(props.order.quantity)
})

// const quantityToFormat = computed(() => {
//   if (!market.value) {
//     return quantity.value.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
//   }

//   return quantity.value.toFormat(market.value.quantityDecimals)
// })

// const unfilledQuantity = computed(() => {
//   if (!market.value) {
//     return ZERO_IN_BASE
//   }

//   return quantity.value.minus(filledQuantity.value)
// })

const filledQuantity = computed(
  () => new BigNumberInBase(props.order.filledQuantity)
)

const leverage = computed(() => {
  if (isReduceOnly.value) {
    return new BigNumberInBase('')
  }

  return new BigNumberInBase(
    price.value.times(quantity.value).dividedBy(margin.value)
  )
})

const isCancelable = computed(
  () => props.order.state === DerivativeOrderState.Booked
)

const total = computed(() => price.value.multipliedBy(quantity.value))

const isBuy = computed(() => {
  if (props.order.direction === DerivativeOrderSide.Buy) {
    return true
  }

  switch (props.order.orderType) {
    case DerivativeOrderSide.TakeBuy:
    case DerivativeOrderSide.StopBuy:
    case DerivativeOrderSide.Buy:
    case DerivativeOrderSide.BuyPO:
      return true
    default:
      return false
  }
})

function onCancelOrder(): void {
  status.setLoading()

  derivativeStore
    .cancelOrder(props.order)
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
              'text-green-500': isBuy,
              'text-red-500': !isBuy
            }"
          >
            {{ isBuy ? $t('trade.buy') : $t('trade.sell') }}
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
          v-if="isCancelable"
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
      <span v-if="isMarketOrder" class="text-white text-xs">
        {{ $t('trade.market') }}
      </span>

      <AppNumber
        v-else
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
