<script lang="ts" setup>
import { ZERO_IN_BASE, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { ONE_IN_BASE } from '@/app/utils/constants'
import { TradeField, TradeForm, UiSpotOrderbookWithSequence } from '@/types'
import { amplitudeConvertTracker } from '@/app/providers/amplitude'

const router = useRouter()
const accountStore = useAccountStore()
const spotStore = useSpotStore()
const exchangeStore = useExchangeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { resetForm, values: formValues } = useForm<TradeForm>()

const isBaseAmount = ref(false)
const market = ref<UiSpotMarketWithToken | undefined>()
const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Idle))
const submitStatus = reactive(new Status(StatusType.Idle))

const { updateAmountFromBase, worstPrice, worstPriceWithSlippage } =
  useSpotPrice({
    formValues: computed(() => formValues),
    market,
    isBaseAmount
  })

const { takerFeeRate } = useTradeFee(computed(() => market.value))

const isBuy = computed(() => formValues[TradeField.OrderSide] === OrderSide.Buy)

const minimalReceived = computed<BigNumberInBase>(() => {
  const quantity = new BigNumberInBase(amount.value || 0)
  const feeRate = new BigNumberInBase(takerFeeRate.value)

  if (isBuy.value) {
    return quantity.dividedBy(
      worstPriceWithSlippage.value.times(ONE_IN_BASE.plus(feeRate))
    )
  }

  return quantity.times(
    worstPriceWithSlippage.value.times(ONE_IN_BASE.minus(feeRate))
  )
})

const amount = computed<string>(() =>
  isBuy.value
    ? formValues[TradeField.QuoteAmount]
    : formValues[TradeField.BaseAmount]
)

// execution_price * quantity * takerFeeRate * (1 - takerFeeRateDiscount)
const fee = computed<BigNumberInBase>(() => {
  const quantity = new BigNumberInBase(formValues[TradeField.QuoteAmount] || 0)

  if (quantity.isNaN() || quantity.lte(0)) {
    return ZERO_IN_BASE
  }

  return quantity.times(takerFeeRate.value)
})

onMounted(() => {
  Promise.all([spotStore.init(), exchangeStore.fetchTradingRewardsCampaign()])
    .catch($onError)
    .finally(() => status.setIdle())
})

onWalletConnected(() => {
  fetchStatus.setLoading()

  Promise.all([
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance(),
    accountStore.fetchAccountPortfolio(),
    exchangeStore.fetchFeeDiscountAccountInfo()
  ])
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
})

function updateAmount({
  amount,
  isBaseAmount: isBaseAmountUpdate
}: {
  amount: string
  isBaseAmount: boolean
}) {
  isBaseAmount.value = isBaseAmountUpdate

  const updatedAmount = updateAmountFromBase({
    amount,
    isBaseAmount: isBaseAmountUpdate
  })

  if (updatedAmount) {
    const field = isBaseAmountUpdate
      ? TradeField.QuoteAmount
      : TradeField.BaseAmount

    formValues[field] = updatedAmount
  }
}

function resetFormValues() {
  const isBuyState = unref(isBuy.value)

  resetForm()

  isBaseAmount.value = !isBuyState

  formValues[TradeField.OrderSide] = isBuyState ? OrderSide.Buy : OrderSide.Sell

  if (market.value) {
    formValues[TradeField.BaseDenom] = market.value.baseDenom
    formValues[TradeField.QuoteDenom] = market.value.quoteDenom
  }
}

function updateUrlQuery() {
  if (!market.value) {
    return
  }

  const { baseToken, quoteToken } = market.value
  const baseSymbol = baseToken.symbol.toLowerCase()
  const quoteSymbol = quoteToken.symbol.toLowerCase()

  router.replace({
    query: isBuy.value
      ? { from: quoteSymbol, to: baseSymbol }
      : { from: baseSymbol, to: quoteSymbol }
  })
}

function handleMarketUpdate(market: UiSpotMarketWithToken) {
  resetFormValues()
  updateUrlQuery()

  fetchStatus.setLoading()

  spotStore.orderbook = {} as UiSpotOrderbookWithSequence

  Promise.all([
    spotStore.cancelTradesStream(),
    spotStore.cancelOrderbookUpdateStream(),
    spotStore.streamTrades(market.marketId),
    spotStore.fetchOrderbook(market.marketId),
    spotStore.streamOrderbookUpdate(market.marketId),
    spotStore.fetchTrades({ marketId: market.marketId })
  ]).finally(() => fetchStatus.setIdle())
}

function handleFormSubmit() {
  if (!market) {
    return
  }

  submitStatus.setLoading()

  spotStore
    .submitMarketOrder({
      isBuy: isBuy.value,
      price: worstPriceWithSlippage.value,
      quantity: formValues[TradeField.BaseAmount],
      market: market.value as UiSpotMarketWithToken
    })
    .then(() => {
      handleConvertAttemptTrack()
      resetFormValues()
      success({ title: t('trade.convert.convert_success') })
    })
    .catch((e) => {
      handleConvertAttemptTrack(e.message)
      $onError(e)
    })
    .finally(() => {
      submitStatus.setIdle()
    })
}

function handleConvertAttemptTrack(error?: string) {
  if (!market.value) {
    return
  }

  const { baseToken, quoteToken } = market.value

  amplitudeConvertTracker.convertAttemptTrackEvent({
    isBuy: isBuy.value,
    baseSymbol: baseToken.symbol,
    quoteSymbol: quoteToken.symbol,
    baseAmount: formValues[TradeField.BaseAmount],
    quoteAmount: formValues[TradeField.QuoteAmount],
    slippageTolerance: formValues[TradeField.SlippageTolerance],
    rate: takerFeeRate.value.times(100).toFormat(2),
    fee: fee.value.toFixed(),
    minimumAmountReceived: minimalReceived.value.toFixed(3),
    error
  })
}
</script>

<template>
  <AppHocLoading
    :status="status"
    class="justify-center flex h-full items-center"
  >
    <div class="max-w-90% w-[448px] mx-auto p-6 bg-gray-850 rounded-lg">
      <div class="mb-6 flex items-center justify-between">
        <h3 class="font-bold text-lg">
          {{ $t('trade.convert.convert') }}
        </h3>
        <PartialsConvertSlippageSelector />
      </div>

      <div class="flex justify-end items-center py-4">
        <PartialsActivitySubaccountsSelector />
      </div>

      <PartialsConvertTokenForm
        v-model:market="market"
        v-model:isBaseAmount="isBaseAmount"
        v-bind="{
          worstPriceWithSlippage,
          isLoading: fetchStatus.isLoading() || submitStatus.isLoading()
        }"
        @update:amount="updateAmount"
        @update:isBuy="updateUrlQuery"
        @update:market="handleMarketUpdate"
      />

      <PartialsConvertSummary
        class="mt-4"
        v-bind="{
          fee,
          isBuy,
          market,
          amount,
          minimalReceived,
          worstPriceWithSlippage,
          isLoading: fetchStatus.isLoading()
        }"
      />

      <PartialsConvertSubmit
        v-if="market"
        class="mt-6"
        v-bind="{
          fee,
          isBuy,
          amount,
          market,
          minimalReceived,
          status: submitStatus,
          executionPrice: worstPrice
        }"
        @form:submit="handleFormSubmit"
      />
    </div>
  </AppHocLoading>
</template>
