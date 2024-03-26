<script lang="ts" setup>
import {
  Status,
  INJ_DENOM,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import type { Token } from '@injectivelabs/token-metadata'
import {
  MAX_QUOTE_DECIMALS,
  QUOTE_DENOMS_GECKO_IDS
} from '@/app/utils/constants'
import {
  getIbcDenomFromSymbolOrNameAsString,
  getPeggyDenomFromSymbolOrNameAsString
} from '@/app/utils/helper'
import { denomClient } from '@/app/Services'
import { usdtToken } from '@/app/data/token'
import { MainPage, SwapForm, SwapFormField } from '@/types'

const spotStore = useSpotStore()
const swapStore = useSwapStore()
const tokenStore = useTokenStore()
const router = useRouter()
const { resetForm, validate, values: formValues } = useForm<SwapForm>()
const setFormValues = useSetFormValues()

const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const hasUserInteraction = ref(false)
const isInputEntered = ref(true)

const { outputToken, inputToken } = useSwap(computed(() => formValues))

const hasInputAmount = computed(() =>
  new BigNumberInBase(formValues[SwapFormField.InputAmount]).gt(0)
)

const hasOutputAmount = computed(() =>
  new BigNumberInBase(formValues[SwapFormField.OutputAmount]).gt(0)
)

onMounted(() => {
  /**
   * We hardcode only the denoms we need on page load for
   * the token selector animation as to not
   * load the component faster as to improve UX
   **/

  const tokensDenomToPreload = [
    INJ_DENOM,
    // getIbcDenomFromSymbolOrNameAsString('SOL', TokenSource.Solana),
    getIbcDenomFromSymbolOrNameAsString('ATOM'),
    getPeggyDenomFromSymbolOrNameAsString('WETH'),
    // getIbcDenomFromSymbolOrNameAsString('PYTH', TokenSource.Solana),
    // getIbcDenomFromSymbolOrNameAsString('WMATIC', TokenSource.Polygon),
    getIbcDenomFromSymbolOrNameAsString('KAVA')
  ]

  const tokens = tokensDenomToPreload.map((denom) =>
    denomClient.getDenomTokenStaticOrUnknown(denom)
  )

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
  const { valid } = await validate()

  if (
    !valid ||
    !inputToken.value ||
    !outputToken.value ||
    !hasInputAmount.value
  ) {
    return
  }

  updateAmount()
}

async function getInputQuantity() {
  const { valid } = await validate()

  if (
    !valid ||
    !inputToken.value ||
    !outputToken.value ||
    !hasOutputAmount.value
  ) {
    return
  }

  updateAmount()
}

function updateAmount() {
  const isUsdtInputDenom =
    formValues[SwapFormField.InputDenom] === usdtToken.denom

  if (isInputEntered.value) {
    const outputAmount = isUsdtInputDenom
      ? new BigNumberInBase(formValues[SwapFormField.InputAmount]).div(
          outputToken.value?.usdPrice || 0
        )
      : new BigNumberInBase(formValues[SwapFormField.InputAmount]).times(
          inputToken.value?.usdPrice || 0
        )
    setFormValues(
      {
        [SwapFormField.OutputAmount]: outputAmount.toFixed(
          outputToken.value?.quantityDecimals || MAX_QUOTE_DECIMALS
        )
      },
      false
    )

    return
  }

  const inputAmount = isUsdtInputDenom
    ? new BigNumberInBase(formValues[SwapFormField.OutputAmount]).times(
        outputToken.value?.usdPrice || 0
      )
    : new BigNumberInBase(formValues[SwapFormField.OutputAmount]).div(
        inputToken.value?.usdPrice || 0
      )

  setFormValues({
    [SwapFormField.InputAmount]: inputAmount.toFixed(
      outputToken.value?.quantityDecimals || MAX_QUOTE_DECIMALS
    )
  })
}

function onNavigation() {
  /* isInputEntered tells us which input field the user has typed a value and hasUserInteraction is used to submit the toAmount by default if no interaction */
  const amount =
    !isInputEntered.value || !hasUserInteraction.value
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
            v-model:is-input-entered="isInputEntered"
            v-bind="{
              isLoading: status.isLoading()
            }"
            @update:outputQuantity="getOutputQuantity"
            @update:inputQuantity="getInputQuantity"
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
