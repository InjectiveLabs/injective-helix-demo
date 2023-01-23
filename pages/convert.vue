<script lang="ts" setup>
import { SpotOrderSide, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeField, TradeForm, TradeFormValue } from '@/types'

const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()
const router = useRouter()
const spotStore = useSpotStore()
const { t } = useLang()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const {
  errors,
  handleSubmit,
  resetForm,
  setFieldValue,
  values: formValues
} = useForm<TradeForm>()

const isBase = ref(false)
const market = ref<UiSpotMarketWithToken | undefined>()
const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Idle))
const submitStatus = reactive(new Status(StatusType.Idle))

const isBuy = computed(
  () => formValues[TradeField.OrderType] === SpotOrderSide.Buy
)

const amount = computed(() => {
  return isBuy.value
    ? formValues[TradeField.QuoteAmount]
    : formValues[TradeField.BaseAmount]
})

const {
  averagePrice,
  averagePriceWithSlippage,
  worstPrice,
  worstPriceWithSlippage
} = useSpotPrice({
  formValues: computed(() => formValues),
  market,
  isBase
})

onMounted(() => {
  Promise.all([
    accountStore.refreshSubaccountBalances(),
    exchangeStore.fetchTradingRewardsCampaign(),
    exchangeStore.fetchFeeDiscountAccountInfo(),
    spotStore.init(),
    accountStore.streamSubaccountBalances()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

function updateFormValue({ field, value }: TradeFormValue) {
  setFieldValue(field, value)
}

function resetFormValues() {
  const isBuyState = unref(isBuy.value)

  resetForm()

  isBase.value = !isBuyState

  updateFormValue({
    field: TradeField.OrderType,
    value: isBuyState ? SpotOrderSide.Buy : SpotOrderSide.Sell
  })

  if (market.value) {
    updateFormValue({
      field: TradeField.BaseDenom,
      value: market.value.baseDenom
    })

    updateFormValue({
      field: TradeField.QuoteDenom,
      value: market.value.quoteDenom
    })
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

  Promise.all([
    spotStore.cancelOrderbookStream(),
    spotStore.cancelTradesStream(),
    spotStore.fetchTrades({ marketId: market.marketId }),
    spotStore.fetchOrderbook(market.marketId),
    spotStore.streamTrades(market.marketId),
    spotStore.streamOrderbook(market.marketId)
  ]).finally(() => fetchStatus.setIdle())
}

const submit = handleSubmit(() => {
  submitStatus.setLoading()

  if (!market) {
    return
  }

  spotStore
    .submitMarketOrder({
      isBuy: isBuy.value,
      market: market.value as UiSpotMarketWithToken,
      price: worstPriceWithSlippage.value,
      quantity: formValues[TradeField.BaseAmount]
    })
    .then(() => {
      resetFormValues()
      success({ title: t('trade.convert.convert_success') })
    })
    .catch($onError)
    .finally(() => {
      submitStatus.setIdle()
    })
})
</script>

<template>
  <AppHocLoading :status="status" class="justify-center">
    <div class="max-w-90% w-[448px] mx-auto p-6 bg-gray-850 rounded-lg">
      <div class="mb-6 flex items-center justify-between">
        <h3 class="font-bold text-lg">
          {{ $t('trade.convert.convert') }}
        </h3>
        <PartialsConvertSlippageSelector />
      </div>

      <PartialsConvertTokenForm
        v-model:isBase="isBase"
        v-model:market="market"
        :worst-price-with-slippage="worstPriceWithSlippage"
        :is-loading="fetchStatus.isLoading() || submitStatus.isLoading()"
        :form-values="formValues"
        @update:isBuy="updateUrlQuery"
        @update:market="handleMarketUpdate"
        @update:formValue="updateFormValue"
      />

      <PartialsConvertSummary
        class="mt-4"
        v-bind="{
          formValues,
          isBuy,
          amount,
          averagePrice,
          averagePriceWithSlippage,
          executePrice: worstPrice,
          market,
          isLoading: fetchStatus.isLoading()
        }"
      />

      <PartialsConvertSubmit
        v-if="market"
        class="mt-6"
        v-bind="{
          formValues,
          amount,
          errors,
          isBuy,
          market,
          executionPrice: worstPrice,
          status: submitStatus
        }"
        @form:submit="submit"
      />
    </div>
  </AppHocLoading>
</template>
