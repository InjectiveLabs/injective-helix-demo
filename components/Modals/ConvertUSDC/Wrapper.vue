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

const accountStore = useAccountStore()
const modalStore = useModalStore()
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

const isBase = ref(false)
const status = reactive(new Status(StatusType.Idle))
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

const { worstPrice, worstPriceWithSlippage } = useSpotPrice({
  formValues: computed(() => formValues),
  market: computed(() => props.market),
  isBase
})

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

  isBase.value = !isBuyState

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

function submitForm() {
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
      accountStore.fetchSubaccountsBalancesWithPrices()
      modalStore.closeModal(Modal.ConvertUSDC)
    })
}

const submit = handleSubmit(submitForm, ({ errors }) => {
  if (Object.keys(errors).length === 0) {
    submitForm()
  }
})

function closeModal() {
  modalStore.closeModal(Modal.ConvertUSDC)
}
</script>

<template>
  <AppModalWrapper
    :show="modalStore.modals[Modal.ConvertUSDC]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>
        {{ $t('account.convertUSDC') }}
      </h3>
    </template>
    <AppHocLoading :status="status" class="justify-center">
      <div class="mx-auto bg-gray-850 rounded-lg justify-center">
        <div class="mb-2">{{ $t('account.whyConvert') }}</div>

        <ModalsConvertUSDCTokenForm
          v-model:isBase="isBase"
          v-bind="{
            balances,
            formValues,
            market,
            worstPriceWithSlippage,
            isLoading: status.isLoading()
          }"
          @update:formValue="updateFormValue"
        />

        <ModalsConvertUSDCSummary
          class="mt-4"
          v-bind="{
            formValues,
            isBuy,
            amount,
            worstPriceWithSlippage,
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
  </AppModalWrapper>
</template>
