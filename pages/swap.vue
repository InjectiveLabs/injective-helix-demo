<script lang="ts" setup>
import { ThrownException } from '@injectivelabs/exceptions'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { Modal, SwapForm, SwapFormField } from '@/types'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import { MAX_QUOTE_DECIMALS } from '@/app/utils/constants'
import { errorMap, mapErrorToMessage } from '@/app/client/utils/swap'
import { toBalanceInToken } from '@/app/utils/formatters'
import { SwapCyTags } from '@/enums'

definePageMeta({
  middleware: ['swap']
})

const swapStore = useSwapStore()
const spotStore = useSpotStore()
const modalStore = useModalStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()
const {
  resetForm,
  validate,
  values: formValues,
  setValues: setFormValues
} = useForm<SwapForm>()

const txHash = ref('')
const summaryRef = ref()
const queryError = ref('')
const showPriceWarning = ref(false)
const status = reactive(new Status(StatusType.Loading))
const submitStatus = reactive(new Status(StatusType.Idle))
const fetchStatus = reactive(new Status(StatusType.Idle))

const {
  inputToken,
  outputToken,
  maximumInput,
  minimumOutput,
  inputTokenMarket,
  outputTokenMarket,
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
  Promise.all([swapStore.fetchRoutes()])
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
      EventTracker.trackSwap(
        {
          fee: totalFee.value.toFixed(2),
          minimumOutput: minimumOutput.value,
          inputToken: inputToken.value?.token.symbol,
          outputToken: outputToken.value?.token.symbol,
          rate: summaryRef.value?.priceForDisplayToFormat,
          inputAmount: formValues[SwapFormField.InputAmount],
          outputAmount: formValues[SwapFormField.OutputAmount],
          slippageTolerance: formValues[SwapFormField.Slippage]
        },
        err?.message
      )

      if (!err) {
        resetFormValues()
      }

      submitStatus.setIdle()
    })
}

function resetFormValues() {
  showPriceWarning.value = false
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

function fetchLastTradedPrices() {
  return Promise.all([
    spotStore.fetchLastTrade({ marketId: inputTokenMarket.value.marketId }),
    spotStore.fetchLastTrade({ marketId: outputTokenMarket.value.marketId })
  ])
    .then(([inputTokenLastTradedPrice, outputTokenLastTradedPrice]) => {
      setFormValues({
        [SwapFormField.InputLastTradedPrice]: sharedToBalanceInWei({
          value: inputTokenLastTradedPrice.price,
          decimalPlaces:
            inputTokenMarket.value.baseToken.decimals -
            inputTokenMarket.value.quoteToken.decimals
        }).toFixed(),
        [SwapFormField.OutputLastTradedPrice]: sharedToBalanceInWei({
          value: outputTokenLastTradedPrice.price,
          decimalPlaces:
            outputTokenMarket.value.baseToken.decimals -
            outputTokenMarket.value.quoteToken.decimals
        }).toFixed()
      })
    })
    .catch($onError)
}

function getOutputQuantity() {
  showPriceWarning.value = false
  fetchStatus.setLoading()

  if (!inputToken.value || !outputToken.value || !hasInputAmount.value) {
    fetchStatus.setIdle()
    showPriceWarning.value = true

    return
  }

  Promise.all([
    fetchLastTradedPrices(),
    swapStore.fetchOutputQuantity({
      inputAmount: formValues[SwapFormField.InputAmount],
      outputToken: outputToken.value,
      inputToken: inputToken.value
    })
  ])
    .then(() => updateAmount())
    .catch((e: ThrownException) => {
      queryError.value = mapErrorToMessage(e.message)
      if (sharedWalletStore.isUserConnected && !hideErrorToast.value) {
        $onError(e)
      }
    })
    .finally(() => {
      fetchStatus.setIdle()
      showPriceWarning.value = true
    })
}

function getInputQuantity() {
  fetchStatus.setLoading()

  if (!inputToken.value || !outputToken.value || !hasOutputAmount.value) {
    fetchStatus.setIdle()
    showPriceWarning.value = true

    return
  }

  Promise.all([
    fetchLastTradedPrices(),
    swapStore.fetchInputQuantity({
      outputAmount: formValues[SwapFormField.OutputAmount],
      outputToken: outputToken.value,
      inputToken: inputToken.value
    })
  ])
    .then(() => updateAmount())
    .catch((e: ThrownException) => {
      queryError.value = mapErrorToMessage(e.message)

      if (sharedWalletStore.isUserConnected && !hideErrorToast.value) {
        $onError(e)
      }
    })
    .finally(() => {
      fetchStatus.setIdle()
      showPriceWarning.value = true
    })
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

function resetPriceWarning() {
  showPriceWarning.value = false
}

function resetQueryError() {
  queryError.value = ''
}
</script>

<template>
  <div>
    <AppHocLoading :status="status" wrapper-class="mt-20">
      <div class="max-w-xl mx-auto w-full lg:mt-20">
        <div
          class="w-full border border-brand-800 rounded-lg px-4 mx-auto h-full overflow-auto flex items-center justify-center"
        >
          <div
            class="rounded-lg mx-auto p-6 h-fit w-full"
            :data-cy="dataCyTag(SwapCyTags.SwapForm)"
          >
            <div class="mb-4 flex items-center justify-between">
              <h3
                class="font-bold text-lg"
                :data-cy="dataCyTag(SwapCyTags.SwapHeaderLabel)"
              >
                {{ $t('trade.swap.swap') }}
              </h3>

              <PartialsSwapSlippageSelector />
            </div>

            <PartialsSwapTokenForm
              v-bind="{
                disabled: fetchStatus.isLoading() || submitStatus.isLoading()
              }"
              @reset:price-warning="resetPriceWarning"
              @update:inputQuantity="getInputQuantity"
              @update:outputQuantity="getOutputQuantity"
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
              <SharedIcon name="cloud-slash" class="h-10 w-10" />

              <div>
                {{ $t('trade.swap.somethingWentWrong') }}
              </div>
              <div>
                {{ $t('trade.swap.pleaseTryAgain') }}
              </div>
            </div>

            <PartialsSwapPriceWarning v-if="showPriceWarning" />

            <PartialsSwapSubmit
              v-bind="{
                queryError,
                showErrorState,
                status: submitStatus,
                isLoading: submitStatus.isLoading() || fetchStatus.isLoading()
              }"
              @submit="submit"
              @update:outputQuantity="getOutputQuantity"
              @update:inputQuantity="getInputQuantity"
            />

            <ModalsSwapSuccess v-bind="{ txHash }" />
          </div>
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
