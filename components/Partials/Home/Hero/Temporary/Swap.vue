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
import { denomClient } from '@/app/Services'

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

onMounted(async () => {
  /** W
   * e hardcode only the denoms we need on page load for the token selector animation as to not load the component faster as to improve UX
   **/
  const injToken = await denomClient.getDenomToken('inj')
  const atomToken = await denomClient.getDenomToken(
    'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9'
  )
  const wethToken = await denomClient.getDenomToken(
    'peggy0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  )
  const wmaticToken = await denomClient.getDenomToken(
    'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1dxv423h8ygzgxmxnvrf33ws3k94aedfdevxd8h'
  )
  const sommToken = await denomClient.getDenomToken(
    'ibc/34346A60A95EB030D62D6F5BDD4B745BE18E8A693372A8A347D5D53DBBB1328B'
  )

  Promise.all([
    tokenStore.fetchTokensUsdPriceMap([
      ...QUOTE_DENOMS_GECKO_IDS,
      ...[
        injToken?.coinGeckoId || '',
        atomToken?.coinGeckoId || '',
        wethToken?.coinGeckoId || '',
        wmaticToken?.coinGeckoId || '',
        sommToken?.coinGeckoId || ''
      ]
    ])
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

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
    </div>
  </Transition>
</template>
