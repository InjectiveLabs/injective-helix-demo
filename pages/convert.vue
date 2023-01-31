<script lang="ts" setup>
import { SpotOrderSide, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeField, TradeForm } from '@/types'

const router = useRouter()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
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

const isBuy = computed(
  () => formValues[TradeField.OrderType] === SpotOrderSide.Buy
)

const amount = computed<string>(() =>
  isBuy.value
    ? formValues[TradeField.QuoteAmount]
    : formValues[TradeField.BaseAmount]
)

onMounted(() => {
  Promise.all([
    spotStore.init(),
    accountStore.streamSubaccountBalances(),
    exchangeStore.fetchTradingRewardsCampaign(),
    exchangeStore.fetchFeeDiscountAccountInfo()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
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

  formValues[TradeField.OrderType] = isBuyState
    ? SpotOrderSide.Buy
    : SpotOrderSide.Sell

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

  Promise.all([
    spotStore.cancelTradesStream(),
    spotStore.cancelOrderbookStream(),
    spotStore.streamTrades(market.marketId),
    spotStore.fetchOrderbook(market.marketId),
    spotStore.streamOrderbook(market.marketId),
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
      resetFormValues()
      success({ title: t('trade.convert.convert_success') })
    })
    .catch($onError)
    .finally(() => {
      submitStatus.setIdle()
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
          isBuy,
          market,
          amount,
          worstPriceWithSlippage,
          isLoading: fetchStatus.isLoading()
        }"
      />

      <PartialsConvertSubmit
        v-if="market"
        class="mt-6"
        v-bind="{
          isBuy,
          amount,
          market,
          status: submitStatus,
          executionPrice: worstPrice
        }"
        @form:submit="handleFormSubmit"
      />
    </div>
  </AppHocLoading>
</template>
