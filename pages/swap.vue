<script lang="ts" setup>
import { ThrownException } from '@injectivelabs/exceptions'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { Modal, SwapForm, SwapFormField } from '@/types'
import { amplitudeSwapTracker } from '@/app/providers/amplitude'
import {
  MAX_QUOTE_DECIMALS,
  QUOTE_DENOMS_GECKO_IDS
} from '@/app/utils/constants'
import { mapErrorToMessage } from '@/app/client/utils/swap'
import { toBalanceInToken } from '@/app/utils/formatters'

const swapStore = useSwapStore()
const spotStore = useSpotStore()
const modalStore = useModalStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()

const { $onError } = useNuxtApp()
const { resetForm, validate, values: formValues } = useForm<SwapForm>()

const txHash = ref('')
const summaryRef = ref()
const queryError = ref('')
const status = reactive(new Status(StatusType.Loading))
const submitStatus = reactive(new Status(StatusType.Idle))
const fetchStatus = reactive(new Status(StatusType.Idle))

const {
  maximumInput,
  minimumOutput,
  outputToken,
  inputToken,
  orderedRouteTokensAndDecimals
} = useSwap(computed(() => formValues))

const { totalFee } = useSwapFee(computed(() => formValues))

const showErrorState = computed(
  () => swapStore.routes.length === 0 || spotStore.markets.length === 0
)

const hasInputAmount = computed(() =>
  new BigNumberInBase(formValues[SwapFormField.InputAmount]).gt(0)
)

const hasOutputAmount = computed(() =>
  new BigNumberInBase(formValues[SwapFormField.OutputAmount]).gt(0)
)

onMounted(() => {
  const spotBaseCoinGeckoIds = spotStore.markets.map(
    ({ baseToken }) => baseToken.coinGeckoId
  )

  Promise.all([
    spotStore.init(),
    swapStore.fetchRoutes(),
    accountStore.fetchAccountPortfolio()
  ])
    .then(async () => {
      await tokenStore.fetchTokensUsdPriceMap([
        ...QUOTE_DENOMS_GECKO_IDS,
        ...spotBaseCoinGeckoIds
      ])
    })
    .catch($onError)
    .finally(() => setTimeout(() => status.setIdle(), 1000))
})

onWalletConnected(() => {
  fetchStatus.setLoading()

  Promise.all([
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance(),
    accountStore.fetchAccountPortfolio()
  ])
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
})

async function submit() {
  const { valid } = await validate()

  if (!valid || !inputToken.value || !outputToken.value) {
    return
  }

  submitStatus.setLoading()

  let err: ThrownException

  const submit = swapStore.isInputEntered
    ? swapStore.submitAtomicOrder
    : swapStore.submitAtomicOrderExactOutput

  submit({
    formValues,
    outputToken: outputToken.value,
    inputToken: inputToken.value,
    minimumOutput: minimumOutput.value,
    maximumInput: maximumInput.value
  })
    .then(async (swapTxHash) => {
      if (!swapTxHash) {
        return
      }

      txHash.value = swapTxHash

      await nextTick()

      modalStore.openModal({ type: Modal.SwapSuccess })
    })
    .catch((error: ThrownException) => {
      err = error

      $onError(error)
    })
    .finally(() => {
      amplitudeSwapTracker.swap({
        error: err,
        fee: totalFee.value,
        rate: summaryRef.value?.priceForDisplayToFormat,
        inputAmount: formValues[SwapFormField.InputAmount],
        outputAmount: formValues[SwapFormField.OutputAmount],
        outputToken: outputToken.value?.token.symbol,
        inputToken: inputToken.value?.token.symbol,
        minimumOutput: minimumOutput.value,
        slippageTolerance: formValues[SwapFormField.Slippage]
      })

      if (!err) {
        resetFormValues()
      }

      submitStatus.setIdle()
    })
}

function resetFormValues() {
  const inputDenom = inputToken.value?.denom
  const outputDenom = outputToken.value?.denom

  resetForm()

  formValues[SwapFormField.InputAmount] = ''
  formValues[SwapFormField.OutputAmount] = ''
  formValues[SwapFormField.InputDenom] = inputDenom || ''
  formValues[SwapFormField.OutputDenom] = outputDenom || ''
}

function getOutputQuantity() {
  fetchStatus.setLoading()

  if (!inputToken.value || !outputToken.value || !hasInputAmount.value) {
    return fetchStatus.setIdle()
  }

  swapStore
    .fetchOutputQuantity({
      inputAmount: formValues[SwapFormField.InputAmount],
      outputToken: outputToken.value,
      inputToken: inputToken.value
    })
    .then(() => {
      updateAmount()
    })
    .catch((e: ThrownException) => {
      queryError.value = mapErrorToMessage(e.message)
      $onError(e)
    })
    .finally(() => fetchStatus.setIdle())
}

function getInputQuantity() {
  fetchStatus.setLoading()

  if (!inputToken.value || !outputToken.value || !hasOutputAmount.value) {
    return fetchStatus.setIdle()
  }

  swapStore
    .fetchInputQuantity({
      outputAmount: formValues[SwapFormField.OutputAmount],
      outputToken: outputToken.value,
      inputToken: inputToken.value
    })
    .then(() => {
      updateAmount()
    })
    .catch((e: ThrownException) => {
      queryError.value = mapErrorToMessage(e.message)

      $onError(e)
    })
    .finally(() => fetchStatus.setIdle())
}

function updateAmount() {
  if (swapStore.isInputEntered) {
    formValues[SwapFormField.OutputAmount] = toBalanceInToken({
      value: swapStore.outputQuantity.resultQuantity,
      decimalPlaces: outputToken.value?.token.decimals || 0,
      fixedDecimals: outputToken.value?.quantityDecimals || MAX_QUOTE_DECIMALS,
      roundingMode: BigNumberInBase.ROUND_DOWN
    })

    return
  }

  formValues[SwapFormField.InputAmount] = toBalanceInToken({
    value: swapStore.inputQuantity.resultQuantity,
    decimalPlaces: inputToken.value?.token.decimals || 0,
    fixedDecimals: inputToken.value?.quantityDecimals || MAX_QUOTE_DECIMALS,
    roundingMode: BigNumberInBase.ROUND_UP
  })
}

function resetQueryError() {
  queryError.value = ''
}
</script>

<template>
  <AppHocLoading :status="status" class="h-full">
    <div class="flex justify-center items-center min-h-screen overflow-auto">
      <div class="bg-gray-850 rounded-lg max-w-90% w-[448px] mx-auto p-6 h-fit">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-bold text-lg">
            {{ $t('trade.swap.swap') }}
          </h3>

          <PartialsSwapSlippageSelector />
        </div>

        <PartialsSwapTokenForm
          v-bind="{
            disabled: fetchStatus.isLoading() || submitStatus.isLoading()
          }"
          @update:outputQuantity="getOutputQuantity"
          @update:inputQuantity="getInputQuantity"
          @reset:queryError="resetQueryError"
          @reset:form="resetFormValues"
        />

        <PartialsSwapSummary
          v-if="
            (!showErrorState &&
              orderedRouteTokensAndDecimals.length > 0 &&
              outputToken) ||
            status.isLoading()
          "
          ref="summaryRef"
          class="mx-4 mt-4 mb-6"
          v-bind="{
            minimumOutput,
            showLoading: status.isLoading(),
            isLoading: fetchStatus.isLoading()
          }"
        />
        <div v-else class="flex flex-col items-center text-gray-700 my-8">
          <BaseIcon name="cloud-slash" class="h-10 w-10" />

          <div>
            {{ $t('trade.swap.somethingWentWrong') }}
          </div>
          <div>
            {{ $t('trade.swap.pleaseTryAgain') }}
          </div>
        </div>

        <PartialsSwapSubmit
          v-bind="{
            queryError,
            showErrorState,
            isLoading: submitStatus.isLoading() || fetchStatus.isLoading()
          }"
          @submit="submit"
          @update:outputQuantity="getOutputQuantity"
          @update:inputQuantity="getInputQuantity"
        />

        <ModalsSwapSuccess v-bind="{ txHash }" />
      </div>
    </div>
  </AppHocLoading>
</template>
