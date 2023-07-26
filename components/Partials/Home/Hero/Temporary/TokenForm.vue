<script lang="ts" setup>
import { SwapForm, SwapFormField } from '@/types'

const swapStore = useSwapStore()
const tokenStore = useTokenStore()
const spotStore = useSpotStore()
const formValues = useFormValues<SwapForm>()

const { accountBalancesWithToken } = useBalance()

const props = defineProps({
  disabled: Boolean,
  hasUserInteraction: Boolean
})

const emit = defineEmits<{
  'reset:form': []
  'reset:queryError': []
  'update:inputQuantity': []
  'update:outputQuantity': []
  'update:hasUserInteraction': [state: boolean]
}>()

const animationCount = ref(0)

const { value: inputDenom } = useStringField({
  name: SwapFormField.InputDenom,
  initialValue: ''
})

const { value: outputDenom } = useStringField({
  name: SwapFormField.OutputDenom,
  initialValue: ''
})

const { inputToken, outputToken } = useSwap(formValues)

const {
  inputDenomOptions,
  outputDenomOptions,
  selectorOutputDenom,
  selectorInputDenom
} = useSwapTokenSelector({
  inputDenom,
  outputDenom,
  balances: accountBalancesWithToken
})

const isUserInteraction = computed({
  get: (): boolean => props.hasUserInteraction,
  set: (hasUserInteraction: boolean) => {
    emit('update:hasUserInteraction', hasUserInteraction)
  }
})

onMounted(() => {
  const [route] = swapStore.routes

  const injToken = spotStore.markets.find(
    ({ baseToken }) => baseToken.symbol.toLowerCase() === 'inj'
  )?.baseToken
  const peggyUsdToken = spotStore.markets.find(
    ({ quoteToken }) => quoteToken.symbol.toLowerCase() === 'usdt'
  )?.quoteToken

  formValues.value[SwapFormField.InputDenom] =
    peggyUsdToken?.denom || route?.sourceDenom
  formValues.value[SwapFormField.OutputDenom] =
    injToken?.denom || route?.targetDenom || ''

  formValues.value[SwapFormField.InputAmount] = String(
    tokenStore.tokenUsdPriceMap[injToken?.coinGeckoId || '']
  )
  formValues.value[SwapFormField.OutputAmount] = '1'
})

function handleInputDenomChange(denom: string) {
  formValues.value[SwapFormField.InputDenom] = denom
  formValues.value[SwapFormField.OutputDenom] = selectorOutputDenom.value

  if (isUserInteraction.value) {
    emit('update:hasUserInteraction', isUserInteraction.value)
    emit('reset:form')
  }
}

function handleOutputDenomChange(denom: string) {
  formValues.value[SwapFormField.OutputDenom] = denom
  formValues.value[SwapFormField.InputDenom] = selectorInputDenom.value

  if (!isUserInteraction.value) {
    formValues.value[SwapFormField.InputAmount] = String(
      outputToken.value?.usdPrice || ''
    )

    return
  }

  emit('reset:form')
}

function handleSwap() {
  const {
    [SwapFormField.InputDenom]: inputDenom,
    [SwapFormField.OutputDenom]: outputDenom,
    [SwapFormField.InputAmount]: inputAmount,
    [SwapFormField.OutputAmount]: outputAmount
  } = formValues.value

  formValues.value[SwapFormField.InputDenom] = outputDenom
  formValues.value[SwapFormField.OutputDenom] = inputDenom

  animationCount.value = animationCount.value + 1

  setTimeout(() => {
    /**
     * We check whether user entered a value in the top or bottom input field
     * Since they will want to retain that value when swapping
     * Then, we query swap SC for the opposing input field's value
     **/
    if (!swapStore.isInputEntered || isUserInteraction.value) {
      formValues.value[SwapFormField.InputAmount] = outputAmount || ''

      getOutputQuantity()
    } else {
      formValues.value[SwapFormField.OutputAmount] = inputAmount || ''

      getInputQuantity()
    }

    emit('update:hasUserInteraction', true)
  }, 50)
}

async function getOutputQuantity() {
  formValues.value[SwapFormField.OutputAmount] = ''

  await nextTick()

  emit('reset:queryError')
  emit('update:outputQuantity')
  emit('update:hasUserInteraction', true)
}

async function getInputQuantity() {
  formValues.value[SwapFormField.InputAmount] = ''

  await nextTick()

  emit('reset:queryError')
  emit('update:inputQuantity')
  emit('update:hasUserInteraction', true)
}
</script>

<template>
  <div class="flex flex-col">
    <Transition name="fade-down" mode="out-in">
      <div :key="animationCount">
        <PartialsHomeHeroTemporarySelectToken
          v-model:is-user-interaction="isUserInteraction"
          v-bind="{
            disabled,
            denom: inputDenom,
            debounce: 600,
            showUsd: true,
            options: inputDenomOptions,
            maxDecimals: inputToken?.quantityDecimals || 0,
            hideMax: false,
            shouldCheckBalance: true,
            amountFieldName: SwapFormField.InputAmount
          }"
          @update:denom="handleInputDenomChange"
          @update:amount="getOutputQuantity"
        >
          <span>{{ $t('trade.swap.youPay') }}</span>
        </PartialsHomeHeroTemporarySelectToken>
      </div>
    </Transition>

    <div class="my-4">
      <BaseIcon
        name="arrow"
        class="mx-auto min-w-6 w-6 h-6 transform -rotate-90 text-black"
        @click="handleSwap"
      />
    </div>

    <Transition name="fade-up" mode="out-in">
      <div :key="animationCount">
        <PartialsHomeHeroTemporarySelectToken
          v-model:is-user-interaction="isUserInteraction"
          v-bind="{
            disabled,
            denom: outputDenom,
            showUsd: false,
            debounce: 600,
            options: outputDenomOptions,
            maxDecimals: outputToken?.quantityDecimals || 0,
            hideMax: true,
            amountFieldName: SwapFormField.OutputAmount
          }"
          @update:denom="handleOutputDenomChange"
          @update:amount="getInputQuantity"
        >
          <span>
            {{ $t('trade.swap.youReceive') }}
          </span>
        </PartialsHomeHeroTemporarySelectToken>
      </div>
    </Transition>
  </div>
</template>
