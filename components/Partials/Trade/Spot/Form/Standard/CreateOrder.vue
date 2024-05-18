<script setup lang="ts">
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  SpotTradeForm,
  SpotTradeFormField,
  TradeTypes,
  spotMarketKey
} from '@/types'

const props = defineProps({
  quantity: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  worstPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const spotStore = useSpotStore()
const resetForm = useResetForm<SpotTradeForm>()
const validate = useValidateForm()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const spotFormValues = useFormValues<SpotTradeForm>()

const isBuy = computed(
  () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
)

const orderTypeToSubmit = computed(() => {
  switch (true) {
    case spotFormValues.value[SpotTradeFormField.PostOnly] && isBuy.value: {
      return OrderSide.BuyPO
    }
    case isBuy.value: {
      return OrderSide.Buy
    }
    case spotFormValues.value[SpotTradeFormField.PostOnly] && !isBuy.value: {
      return OrderSide.SellPO
    }
    case !isBuy.value: {
      return OrderSide.Sell
    }
    default: {
      return OrderSide.Buy
    }
  }
})

const market = inject(spotMarketKey)

const currentFormValues = computed(() => ({
  type: spotFormValues.value[SpotTradeFormField.Type],
  side: spotFormValues.value[SpotTradeFormField.Side]
}))

function submitLimitOrder() {
  if (!market?.value) {
    return
  }

  status.setLoading()

  const limitPrice = new BigNumberInBase(
    spotFormValues.value[SpotTradeFormField.Price] || 0
  )

  const quantity = new BigNumberInBase(props.quantity)

  spotStore
    .submitLimitOrder({
      market: market?.value,
      price: limitPrice,
      quantity,
      orderSide: orderTypeToSubmit.value
    })
    .then(() => {
      success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function submitMarketOrder() {
  if (!market?.value) {
    return
  }

  status.setLoading()

  const quantity = new BigNumberInBase(props.quantity)

  spotStore
    .submitMarketOrder({
      quantity,
      orderSide: orderTypeToSubmit.value,
      market: market.value,
      price: props.worstPrice
    })
    .then(() => {
      success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

async function submitOrder() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit) {
    submitLimitOrder()
  } else {
    submitMarketOrder()
  }
}
</script>

<template>
  <div>
    <AppButton
      :key="spotFormValues[SpotTradeFormField.Side]"
      :variant="isBuy ? 'success' : 'danger'"
      class="w-full"
      v-bind="{ status }"
      @click="submitOrder"
    >
      {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
    </AppButton>
  </div>
</template>
