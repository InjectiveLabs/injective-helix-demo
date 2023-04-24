<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { AccountBalance, Modal, TradeField, TradeForm } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

const spotStore = useSpotStore()
const accountStore = useAccountStore()
const modalStore = useModalStore()
const { t } = useLang()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { errors, resetForm, values: formValues } = useForm<TradeForm>()

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  balances: {
    type: Object as PropType<AccountBalance[]>,
    required: true
  }
})

const isBaseAmount = ref(false)
const status = reactive(new Status(StatusType.Idle))
const fetchStatus = reactive(new Status(StatusType.Idle))
const submitStatus = reactive(new Status(StatusType.Idle))

const isModalOpen = computed(() => modalStore.modals[Modal.ConvertUsdc])

const isBuy = computed(() => formValues[TradeField.OrderSide] === OrderSide.Buy)

const amount = computed(() =>
  isBuy.value
    ? formValues[TradeField.QuoteAmount]
    : formValues[TradeField.BaseAmount]
)

const { updateAmountFromBase, worstPrice, worstPriceWithSlippage } =
  useSpotPrice({
    formValues: computed(() => formValues),
    market: computed(() => props.market),
    isBaseAmount
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
    formValues[
      isBaseAmountUpdate ? TradeField.QuoteAmount : TradeField.BaseAmount
    ] = updatedAmount
  }
}

onMounted(() => {
  fetchStatus.setLoading()

  Promise.all([
    accountStore.fetchAccountPortfolio(),
    spotStore.fetchOrderbook(props.market.marketId),
    spotStore.streamOrderbookUpdate(props.market.marketId)
  ]).finally(() => fetchStatus.setIdle())
})

function resetFormValues() {
  const isBuyState = unref(isBuy.value)

  resetForm()

  isBaseAmount.value = !isBuyState

  formValues[TradeField.OrderSide] = isBuyState ? OrderSide.Buy : OrderSide.Sell
  formValues[TradeField.BaseDenom] = props.market.baseDenom
  formValues[TradeField.QuoteDenom] = props.market.quoteDenom
}

function handleFormSubmit() {
  submitStatus.setLoading()

  spotStore
    .submitMarketOrder({
      isBuy: isBuy.value,
      market: props.market as UiSpotMarketWithToken,
      price: worstPriceWithSlippage.value,
      quantity: formValues[TradeField.BaseAmount]
    })
    .then(() => {
      resetFormValues()
      accountStore.fetchAccountPortfolio()
      success({ title: t('trade.convert.convert_success') })
    })
    .catch($onError)
    .finally(() => {
      submitStatus.setIdle()
      modalStore.closeModal(Modal.ConvertUsdc)
    })
}

function closeModal() {
  modalStore.closeModal(Modal.ConvertUsdc)
}
</script>

<template>
  <AppModal :show="isModalOpen" sm @modal:closed="closeModal">
    <template #title>
      <h3>
        {{ $t('account.convertUsdc') }}
      </h3>
    </template>
    <AppHocLoading :status="status" class="justify-center">
      <div class="mx-auto bg-gray-850 rounded-lg justify-center">
        <div v-if="market.baseToken.denom === usdcTokenDenom.USDC" class="mb-6">
          {{ $t('account.whyConvert') }}
        </div>

        <ModalsConvertUsdcTokenForm
          v-model:isBaseAmount="isBaseAmount"
          v-bind="{
            market,
            balances,
            worstPriceWithSlippage,
            isLoading: fetchStatus.isLoading() || submitStatus.isLoading()
          }"
          @update:amount="updateAmount"
        />

        <ModalsConvertUsdcSummary
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
            amount,
            errors,
            isBuy,
            market,
            isUsdcConvert: true,
            status: submitStatus,
            executionPrice: worstPrice
          }"
          @form:submit="handleFormSubmit"
        />
      </div>
    </AppHocLoading>
  </AppModal>
</template>
