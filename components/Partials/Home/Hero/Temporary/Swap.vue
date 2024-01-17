<script lang="ts" setup>
import {
  Status,
  INJ_DENOM,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import { ThrownException } from '@injectivelabs/exceptions'
import {
  MAX_QUOTE_DECIMALS,
  QUOTE_DENOMS_GECKO_IDS
} from '@/app/utils/constants'
import {
  getCw20FromSymbolOrNameAsString,
  getIbcDenomFromSymbolOrNameAsString,
  getPeggyDenomFromSymbolOrNameAsString
} from '@/app/utils/helper'
import { denomClient } from '@/app/Services'
import { toBalanceInToken } from '@/app/utils/formatters'
import { mapErrorToMessage } from '@/app/client/utils/swap'
import { MainPage, SwapForm, SwapFormField } from '@/types'

const spotStore = useSpotStore()
const swapStore = useSwapStore()
const tokenStore = useTokenStore()
const router = useRouter()
const { resetForm, validate, values: formValues } = useForm<SwapForm>()
const setFormValues = useSetFormValues()

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

onMounted(async () => {
  /**
   * We hardcode only the denoms we need on page load for
   * the token selector animation as to not
   * load the component faster as to improve UX
   **/

  const tokensDenomToPreload = [
    INJ_DENOM,
    getCw20FromSymbolOrNameAsString('SOL'),
    getIbcDenomFromSymbolOrNameAsString('ATOM'),
    getPeggyDenomFromSymbolOrNameAsString('WETH'),
    getCw20FromSymbolOrNameAsString('WMATIC'),
    getIbcDenomFromSymbolOrNameAsString('KAVA')
  ]

  const tokens = await denomClient.getDenomsToken(tokensDenomToPreload)

  Promise.all([
    tokenStore.getTokensUsdPriceMapFromToken(tokens as Token[]),
    tokenStore.fetchTokensUsdPriceMap(QUOTE_DENOMS_GECKO_IDS)
  ]).catch($onError)

  Promise.all([spotStore.init(), swapStore.fetchRoutes()])
    .then(async () => {
      const spotBaseTokens = spotStore.markets.map(({ baseToken }) => baseToken)

      await tokenStore.getTokensUsdPriceMapFromToken(spotBaseTokens)
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

function resetFormValues() {
  const inputDenom = inputToken.value?.denom
  const outputDenom = outputToken.value?.denom

  resetForm()

  setFormValues({
    [SwapFormField.InputAmount]: '',
    [SwapFormField.OutputAmount]: '',
    [SwapFormField.InputDenom]: inputDenom || '',
    [SwapFormField.OutputDenom]: outputDenom || ''
  })
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

  setFormValues({
    [SwapFormField.InputAmount]: toBalanceInToken({
      value: swapStore.inputQuantity.resultQuantity,
      decimalPlaces: inputToken.value?.token.decimals || 0,
      fixedDecimals: inputToken.value?.quantityDecimals || MAX_QUOTE_DECIMALS,
      roundingMode: BigNumberInBase.ROUND_UP
    })
  })
}

function resetQueryError() {
  queryError.value = ''
}

function onNavigation() {
  /* isInputEntered tells us which input field the user has typed a value and hasUserInteraction is used to submit the toAmount by default if no interaction */
  const amount =
    !swapStore.isInputEntered || !hasUserInteraction.value
      ? { toAmount: formValues[SwapFormField.OutputAmount] }
      : { fromAmount: formValues[SwapFormField.InputAmount] }

  router.push({
    name: MainPage.Swap,
    query: {
      from: formValues[SwapFormField.InputDenom],
      to: formValues[SwapFormField.OutputDenom],
      ...amount
    }
  })
}
</script>

<template>
  <Transition name="fade">
    <div v-if="status.isIdle()" class="h-full max-w-md">
      <div class="bg-white rounded-lg self-center shadow-light">
        <div class="overflow-auto p-6">
          <PartialsHomeHeroTemporaryTokenForm
            v-model:has-user-interaction="hasUserInteraction"
            v-bind="{
              disabled: status.isLoading()
            }"
            @update:outputQuantity="getOutputQuantity"
            @update:inputQuantity="getInputQuantity"
            @queryError:reset="resetQueryError"
            @form:reset="resetFormValues"
          />

          <AppButton
            class="w-full bg-blue-500 font-semibold mt-4 text-white"
            is-lg
            @click="onNavigation"
          >
            {{ $t('trade.get') }}
            <span class="uppercase">
              {{ outputToken?.token.symbol || 'INJ' }}
            </span>
          </AppButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
