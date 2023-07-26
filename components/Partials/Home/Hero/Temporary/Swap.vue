<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { ThrownException } from '@injectivelabs/exceptions'
import { SwapForm, SwapFormField } from '@/types'
import {
  MAX_QUOTE_DECIMALS,
  QUOTE_DENOMS_GECKO_IDS
} from '@/app/utils/constants'
import { mapErrorToMessage } from '@/app/client/utils/swap'
import { toBalanceInToken } from '@/app/utils/formatters'

const spotStore = useSpotStore()
const swapStore = useSwapStore()
const tokenStore = useTokenStore()
const router = useRouter()
const { resetForm, validate, values: formValues } = useForm<SwapForm>()

const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Idle))
const queryError = ref('')
const hasUserInteraction = ref(false)

const { outputToken, inputToken } = useSwap(computed(() => formValues))

const hasInputAmount = computed(() =>
  new BigNumberInBase(formValues[SwapFormField.InputAmount]).gt(0)
)

const hasOutputAmount = computed(() =>
  new BigNumberInBase(formValues[SwapFormField.OutputAmount]).gt(0)
)

onMounted(() => {
  Promise.all([spotStore.init(), swapStore.fetchRoutes()])
    .then(async () => {
      const spotBaseCoinGeckoIds = spotStore.markets.map(
        ({ baseToken }) => baseToken.coinGeckoId
      )

      await tokenStore.fetchTokensUsdPriceMap([
        ...QUOTE_DENOMS_GECKO_IDS,
        ...spotBaseCoinGeckoIds
      ])
    })
    .catch($onError)
    .finally(() => setTimeout(() => status.setIdle(), 1000))
})

function resetFormValues() {
  const inputDenom = inputToken.value?.denom
  const outputDenom = outputToken.value?.denom

  resetForm()

  formValues[SwapFormField.InputAmount] = ''
  formValues[SwapFormField.OutputAmount] = ''
  formValues[SwapFormField.InputDenom] = inputDenom || ''
  formValues[SwapFormField.OutputDenom] = outputDenom || ''
}

async function getOutputQuantity() {
  fetchStatus.setLoading()

  const { valid } = await validate()

  if (
    !valid ||
    !inputToken.value ||
    !outputToken.value ||
    !hasInputAmount.value
  ) {
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

async function getInputQuantity() {
  fetchStatus.setLoading()

  const { valid } = await validate()

  if (
    !valid ||
    !inputToken.value ||
    !outputToken.value ||
    !hasOutputAmount.value
  ) {
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

function handleNavigation() {
  /* isInputEntered tells us which input field the user has typed a value and hasUserInteraction is used to submit the toAmount by default if no interaction */
  const amount =
    !swapStore.isInputEntered || !hasUserInteraction.value
      ? { toAmount: formValues[SwapFormField.OutputAmount] }
      : { fromAmount: formValues[SwapFormField.InputAmount] }

  router.push({
    name: 'swap',
    query: {
      from: formValues[SwapFormField.InputDenom],
      to: formValues[SwapFormField.OutputDenom],
      ...amount
    }
  })
}
</script>

<template>
  <AppHocLoading :show-loading="status.isLoading()">
    <div class="bg-white rounded-lg w-full self-center shadow-light">
      <div class="overflow-auto p-6">
        <PartialsHomeHeroTemporaryTokenForm
          v-model:has-user-interaction="hasUserInteraction"
          v-bind="{
            disabled: status.isLoading()
          }"
          @update:outputQuantity="getOutputQuantity"
          @update:inputQuantity="getInputQuantity"
          @reset:queryError="resetQueryError"
          @reset:form="resetFormValues"
        />

        <AppButton
          class="w-full bg-blue-500 font-semibold mt-4 text-white"
          lg
          @click="handleNavigation"
        >
          Get
          <span class="uppercase">
            {{ outputToken?.token.symbol || 'INJ' }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppHocLoading>
</template>
