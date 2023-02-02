<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSpotMarketWithToken, SpotOrderSide } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  BalanceWithToken,
  Modal,
  TradeField,
  TradeForm,
  TradeFormValue
} from '@/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'

const modalStore = useModalStore()
const spotStore = useSpotStore()
const walletStore = useWalletStore()
const { getMarketIdByRouteQuery, tradableTokenMaps } = useConvertFormatter()

const props = defineProps({
  isBase: Boolean,
  isLoading: Boolean,

  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    default: () => null
  }
})

const emit = defineEmits<{
  (e: 'update:isBase', state: boolean): void
  (e: 'update:market', state: UiSpotMarketWithToken): void
  (e: 'update:formValue', state: TradeFormValue): void
  (
    e: 'update:amount',
    { amount, isBase }: { amount: string; isBase: boolean }
  ): void
}>()

const animationCount = ref(0)

const { takerFeeRate } = useTradeFee(computed(() => props.market))

const { value: baseTokenDenom, setValue: setBaseTokenDenom } = useStringField({
  name: TradeField.BaseDenom
})

const { value: quoteTokenDenom, setValue: setQuoteTokenDenom } = useStringField(
  {
    name: TradeField.QuoteDenom
  }
)

const { value: orderType, setValue: setOrderType } = useStringField({
  name: TradeField.OrderType,
  initialValue: SpotOrderSide.Buy
})

const baseTokens = computed<BalanceWithToken[]>(
  () => tradableTokenMaps.value[baseTokenDenom.value] || []
)
const quoteTokens = computed<BalanceWithToken[]>(
  () => tradableTokenMaps.value[quoteTokenDenom.value] || []
)

const isBuy = computed(() => orderType.value === SpotOrderSide.Buy)

onMounted(() => {
  const { market, orderType } = getMarketIdByRouteQuery()

  if (!walletStore.hasEnoughInjForGas) {
    modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }

  if (market) {
    emit('update:market', market)
    setOrderType(orderType)
    setBaseTokenDenom(market.baseDenom)
    setQuoteTokenDenom(market.quoteDenom)
  }
})

function handleUpdateMarket() {
  const market = spotStore.markets.find(({ baseDenom, quoteDenom }) => {
    return (
      baseDenom === baseTokenDenom.value && quoteDenom === quoteTokenDenom.value
    )
  })

  if (market) {
    emit('update:market', market)
  }
}

function toggleOrderType() {
  setOrderType(isBuy.value ? SpotOrderSide.Sell : SpotOrderSide.Buy)
}

function handleSwap() {
  animationCount.value = animationCount.value + 1

  emit('update:isBase', !props.isBase)

  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: ''
  })

  emit('update:formValue', {
    field: TradeField.QuoteAmount,
    value: ''
  })

  toggleOrderType()
}

function updateAmount({ amount, isBase }: { amount: string; isBase: boolean }) {
  emit('update:amount', { amount, isBase })
}

function handleMaxBaseAmountChange(amount: string) {
  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: amount
  })

  updateAmount({ amount, isBase: true })
}

function handleMaxQuoteAmountChange(amount: string) {
  const amountInBigNumber = new BigNumberInBase(amount)

  const feeRateToDeduct = amountInBigNumber.times(takerFeeRate.value)
  const amountDeductFee = amountInBigNumber.minus(feeRateToDeduct)

  const amountDeductFeeToFixed = amountDeductFee.toFixed(
    props.market.priceDecimals,
    TRADE_FORM_PRICE_ROUNDING_MODE
  )

  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: amountDeductFeeToFixed
  })

  emit('update:amount', { amount: amountDeductFeeToFixed, isBase: false })
}

watch(
  () => props.worstPriceWithSlippage,
  () => {
    emit('update:amount', {
      amount: props.isBase
        ? props.formValues[TradeField.BaseAmount]
        : props.formValues[TradeField.QuoteAmount],
      isBase: props.isBase
    })
  }
)
</script>

<template>
  <div class="flex flex-col">
    <transition :name="isBuy ? 'fade-up' : 'fade-down'" mode="out-in">
      <div
        :key="animationCount"
        :class="[isBuy ? 'order-first' : 'order-last']"
      >
        <AppSelectToken
          v-model:denom="quoteTokenDenom"
          :amount-field-name="TradeField.QuoteAmount"
          :required="isBuy"
          :disabled="isLoading"
          :hide-max="!isBuy"
          :max-decimals="market?.quantityDecimals"
          :options="baseTokens"
          @update:amount="updateAmount"
          @update:denom="handleUpdateMarket"
          @update:max="handleMaxQuoteAmountChange"
        >
          <span>
            {{ $t(`trade.convert.${isBuy ? 'youPay' : 'youReceive'}`) }}
          </span>
        </AppSelectToken>
      </div>
    </transition>

    <div class="my-4">
      <BaseIcon name="arrow-up-down" class="mx-auto" @click="handleSwap" />
    </div>

    <transition :name="isBuy ? 'fade-down' : 'fade-up'" mode="out-in">
      <div
        :key="animationCount"
        :class="[isBuy ? 'order-last' : 'order-first']"
      >
        <AppSelectToken
          v-model:denom="baseTokenDenom"
          :amount-field-name="TradeField.BaseAmount"
          :disabled="isLoading"
          :required="!isBuy"
          :hide-max="isBuy"
          :max-decimals="market?.quantityDecimals"
          :options="quoteTokens"
          @update:amount="updateAmount"
          @update:max="handleMaxBaseAmountChange"
          @update:denom="handleUpdateMarket"
        >
          <span>
            {{ $t(`trade.convert.${isBuy ? 'youReceive' : 'youPay'}`) }}
          </span>
        </AppSelectToken>
      </div>
    </transition>
  </div>
</template>
