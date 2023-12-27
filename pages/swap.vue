<script lang="ts" setup>
import { ThrownException } from '@injectivelabs/exceptions'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { Modal, SwapForm, SwapFormField } from '@/types'
import { mixpanelEvents } from '@/app/providers/mixpanel/TrackingEvents'
import {
  MAX_QUOTE_DECIMALS,
  QUOTE_DENOMS_GECKO_IDS
} from '@/app/utils/constants'
import { errorMap, mapErrorToMessage } from '@/app/client/utils/swap'
import { toBalanceInToken } from '@/app/utils/formatters'

definePageMeta({
  middleware: ['swap']
})

const swapStore = useSwapStore()
const spotStore = useSpotStore()
const modalStore = useModalStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()

const { $onError } = useNuxtApp()
const { resetForm, validate, values: formValues } = useForm<SwapForm>()
const setFormValues = useSetFormValues()

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

const hideErrorToast = computed(() =>
  Object.values(errorMap).includes(queryError.value)
)

onMounted(() => {
  initRoutes()
})

onWalletConnected(() => {
  fetchStatus.setLoading()

  Promise.all([
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance()
  ])
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
})

function initRoutes() {
  Promise.all([
    spotStore.init(),
    swapStore.fetchRoutes(),
    accountStore.fetchAccountPortfolio()
  ])
    .then(async () => {
      await Promise.all([
        tokenStore.fetchTokensUsdPriceMap([...QUOTE_DENOMS_GECKO_IDS]),
        tokenStore.getTokensUsdPriceMapFromToken(
          spotStore.markets.map(({ baseToken }) => baseToken)
        )
      ])
    })
    .catch($onError)
    .finally(() => setTimeout(() => status.setIdle(), 1000))
}

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

      modalStore.openModal(Modal.SwapSuccess)
    })
    .catch((error: ThrownException) => {
      err = error

      $onError(error)
    })
    .finally(() => {
      mixpanelEvents.swap({
        fee: totalFee.value.toFixed(2),
        rate: summaryRef.value?.priceForDisplayToFormat,
        inputAmount: formValues[SwapFormField.InputAmount],
        outputAmount: formValues[SwapFormField.OutputAmount],
        outputToken: outputToken.value?.token.symbol,
        inputToken: inputToken.value?.token.symbol,
        minimumOutput: minimumOutput.value,
        slippageTolerance: formValues[SwapFormField.Slippage],
        error: err ? err.message : '',
        isSuccess: !err
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

  setFormValues(
    {
      [SwapFormField.InputAmount]: '',
      [SwapFormField.OutputAmount]: '',
      [SwapFormField.InputDenom]: inputDenom || '',
      [SwapFormField.OutputDenom]: outputDenom || ''
    },
    false
  )
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
      if (walletStore.isUserWalletConnected && !hideErrorToast.value) {
        $onError(e)
      }
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

      if (walletStore.isUserWalletConnected && !hideErrorToast.value) {
        $onError(e)
      }
    })
    .finally(() => fetchStatus.setIdle())
}

function updateAmount() {
  if (swapStore.isInputEntered) {
    setFormValues(
      {
        [SwapFormField.OutputAmount]: toBalanceInToken({
          value: swapStore.outputQuantity.resultQuantity,
          decimalPlaces: outputToken.value?.token.decimals || 0,
          fixedDecimals:
            outputToken.value?.quantityDecimals || MAX_QUOTE_DECIMALS,
          roundingMode: BigNumberInBase.ROUND_DOWN
        })
      },
      false
    )

    return
  }

  setFormValues(
    {
      [SwapFormField.InputAmount]: toBalanceInToken({
        value: swapStore.inputQuantity.resultQuantity,
        decimalPlaces: inputToken.value?.token.decimals || 0,
        fixedDecimals: inputToken.value?.quantityDecimals || MAX_QUOTE_DECIMALS,
        roundingMode: BigNumberInBase.ROUND_UP
      })
    },
    false
  )
}

function resetQueryError() {
  queryError.value = ''
}
</script>

<template>
  <AppHocLoading :status="status" class="h-full container">
    <div
      class="w-full px-4 max-w-xl mx-auto h-full overflow-auto flex items-center justify-center"
    >
      <div class="bg-gray-850 rounded-lg mx-auto p-6 h-fit w-full">
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
          @queryError:reset="resetQueryError"
          @form:reset="resetFormValues"
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
            isLoading: status.isLoading() || fetchStatus.isLoading()
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
