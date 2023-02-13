<script lang="ts" setup>
import { PropType } from 'vue'
import { SpotOrderSide, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Modal, TradeField, TradeForm } from '@/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'

const route = useRoute()
const modalStore = useModalStore()
const spotStore = useSpotStore()
const bankStore = useBankStore()

const formValues = useFormValues<TradeForm>()

const props = defineProps({
  isLoading: Boolean,
  isBaseAmount: Boolean,

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    default: () => null
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:isBaseAmount', state: boolean): void
  (e: 'update:market', state: UiSpotMarketWithToken): void
  (
    e: 'update:amount',
    { amount, isBaseAmount }: { amount: string; isBaseAmount: boolean }
  ): void
}>()

const animationCount = ref(0)

const { takerFeeRate } = useTradeFee(computed(() => props.market))

const { tradableSlugMap, tradableTokenMaps } = useConvertFormatter()

const isBuy = computed(() => orderType.value === SpotOrderSide.Buy)

const baseTokens = computed(
  () => tradableTokenMaps.value[baseTokenDenom.value] || []
)

const quoteTokens = computed(
  () => tradableTokenMaps.value[quoteTokenDenom.value] || []
)

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

onMounted(() => {
  if (!bankStore.hasEnoughInjForGas) {
    modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }

  setMarketFromQuery()
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

  emit('update:isBaseAmount', !props.isBaseAmount)

  formValues.value[TradeField.BaseAmount] = ''
  formValues.value[TradeField.QuoteAmount] = ''

  toggleOrderType()
}

function updateAmount({
  amount,
  isBaseAmount
}: {
  amount: string
  isBaseAmount: boolean
}) {
  emit('update:amount', { amount, isBaseAmount })
}

function handleMaxBaseAmountChange({ amount }: { amount: string }) {
  formValues.value[TradeField.BaseAmount] = amount

  updateAmount({ amount, isBaseAmount: true })
}

function handleMaxQuoteAmountChange({ amount }: { amount: string }) {
  const amountInBigNumber = new BigNumberInBase(amount)

  const feeRateToDeduct = amountInBigNumber.times(takerFeeRate.value)
  const amountDeductFee = amountInBigNumber.minus(feeRateToDeduct)

  const amountDeductFeeToFixed = amountDeductFee.toFixed(
    props.market.priceDecimals,
    TRADE_FORM_PRICE_ROUNDING_MODE
  )

  formValues.value[TradeField.QuoteAmount] = amountDeductFeeToFixed

  emit('update:amount', { amount: amountDeductFeeToFixed, isBaseAmount: false })
}

function setMarketFromQuery() {
  const { to, from } = route.query
  const querySlug = `${from}-${to}`

  const { market, orderType } =
    tradableSlugMap.value[querySlug.toLowerCase()] ||
    tradableSlugMap.value['usdt-inj']

  if (!market) {
    return
  }

  emit('update:market', market)
  setOrderType(orderType)
  setBaseTokenDenom(market.baseDenom)
  setQuoteTokenDenom(market.quoteDenom)
}

watch(
  () => props.worstPriceWithSlippage,
  () => {
    emit('update:amount', {
      amount: props.isBaseAmount
        ? formValues.value[TradeField.BaseAmount]
        : formValues.value[TradeField.QuoteAmount],
      isBaseAmount: props.isBaseAmount
    })
  }
)
</script>

<template>
  <div class="flex flex-col">
    <transition :name="isBuy ? 'fade-up' : 'fade-down'" mode="out-in">
      <div
        :key="`animation-${animationCount}`"
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
        :key="`animation-${animationCount}`"
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
