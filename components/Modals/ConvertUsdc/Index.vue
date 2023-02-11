<script lang="ts" setup>
import { PropType } from 'vue'
import { SpotOrderSide, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  AccountBalance,
  Modal,
  TradeField,
  TradeForm,
  TradeFormValue
} from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

const accountStore = useAccountStore()
const modalStore = useModalStore()
const spotStore = useSpotStore()
const { t } = useLang()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const {
  errors,
  resetForm,
  setFieldValue,
  values: formValues
} = useForm<TradeForm>()

const props = defineProps({
  balances: {
    type: Object as PropType<AccountBalance[]>,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const isBaseAmount = ref(false)
const status = reactive(new Status(StatusType.Idle))
const fetchStatus = reactive(new Status(StatusType.Idle))
const submitStatus = reactive(new Status(StatusType.Idle))

const hasFormErrors = computed(() => Object.keys(errors.value).length === 0)
const isModalOpen = computed(() => modalStore.modals[Modal.ConvertUsdc])

const isBuy = computed(
  () => formValues[TradeField.OrderType] === SpotOrderSide.Buy
)

const amount = computed(() => {
  return isBuy.value
    ? formValues[TradeField.QuoteAmount]
    : formValues[TradeField.BaseAmount]
})

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
    updateFormValue({
      field: isBaseAmountUpdate
        ? TradeField.QuoteAmount
        : TradeField.BaseAmount,
      value: updatedAmount
    })
  }
}

onMounted(() => {
  Promise.all([
    spotStore.fetchOrderbook(props.market.marketId),
    spotStore.streamOrderbook(props.market.marketId)
  ]).finally(() => fetchStatus.setIdle())
})

function updateFormValue({ field, value }: TradeFormValue) {
  setFieldValue(field, value)
}

function resetFormValues() {
  const isBuyState = unref(isBuy.value)

  resetForm()

  isBaseAmount.value = !isBuyState

  updateFormValue({
    field: TradeField.OrderType,
    value: isBuyState ? SpotOrderSide.Buy : SpotOrderSide.Sell
  })
  updateFormValue({
    field: TradeField.BaseDenom,
    value: props.market.baseDenom
  })
  updateFormValue({
    field: TradeField.QuoteDenom,
    value: props.market.quoteDenom
  })
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
      success({ title: t('trade.convert.convert_success') })
    })
    .catch($onError)
    .finally(() => {
      submitStatus.setIdle()
      accountStore.updateSubaccount()
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
        <div
          v-if="market.baseToken.denom.toLowerCase() === usdcTokenDenom.USDC"
          class="mb-6"
        >
          {{ $t('account.whyConvert') }}
        </div>

        <ModalsConvertUsdcTokenForm
          v-model:isBaseAmount="isBaseAmount"
          v-bind="{
            market,
            balances,
            formValues,
            worstPriceWithSlippage,
            isLoading: status.isLoading()
          }"
          @update:amount="updateAmount"
          @update:formValue="updateFormValue"
        />

        <ModalsConvertUsdcSummary
          class="mt-4"
          v-bind="{
            isBuy,
            market,
            amount,
            formValues,
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
            formValues,
            hasFormErrors,
            executionPrice: worstPrice,
            status: submitStatus
          }"
          @form:submit="handleFormSubmit"
        />
      </div>
    </AppHocLoading>
  </AppModal>
</template>
