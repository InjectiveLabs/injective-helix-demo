<script lang="ts" setup>
import { SwapForm, SwapFormField } from '@/types'
import { TokenSymbols } from '@/app/data/token'

const swapStore = useSwapStore()
const formValues = useFormValues<SwapForm>()
const { query } = useRoute()
const { accountBalancesWithToken } = useBalance()

defineProps({
  disabled: Boolean
})

const emit = defineEmits<{
  'reset:form': []
  'reset:queryError': []
  'update:inputQuantity': []
  'update:outputQuantity': []
}>()

const animationCount = ref(0)

const { value: inputDenom } = useStringField({
  name: SwapFormField.InputDenom,
  initialValue: swapStore?.routes[0]?.sourceDenom
})

const { value: outputDenom } = useStringField({
  name: SwapFormField.OutputDenom,
  initialValue: swapStore.routes[0]?.targetDenom
})

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

const { inputToken, outputToken, orderedRouteTokensAndDecimals } =
  useSwap(formValues)

onMounted(() => {
  const injToken = orderedRouteTokensAndDecimals.value.find(
    ({ token }) => token.symbol === TokenSymbols.INJ
  )?.token
  const usdtToken = orderedRouteTokensAndDecimals.value.find(
    ({ token }) => token.symbol === TokenSymbols.USDT
  )?.token

  const [route] = swapStore.routes

  formValues.value[SwapFormField.InputDenom] =
    usdtToken?.denom || route?.sourceDenom || ''
  formValues.value[SwapFormField.OutputDenom] =
    injToken?.denom || route?.targetDenom || ''

  if (Object.keys(query).length !== 0) {
    handleQuery()
  }
})

function handleQuery() {
  const { to, from, toAmount, fromAmount } = query

  if (to && from) {
    formValues.value[SwapFormField.InputDenom] = from as string
    formValues.value[SwapFormField.OutputDenom] = to as string
  }

  if (fromAmount) {
    formValues.value[SwapFormField.InputAmount] = fromAmount as string

    getOutputQuantity()
  } else if (toAmount) {
    formValues.value[SwapFormField.OutputAmount] = toAmount as string

    getInputQuantity()
  }
}

function handleInputDenomChange() {
  formValues.value[SwapFormField.OutputDenom] = selectorOutputDenom.value

  emit('reset:form')
}

function handleOutputDenomChange() {
  formValues.value[SwapFormField.InputDenom] = selectorInputDenom.value
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
    if (swapStore.isInputEntered) {
      formValues.value[SwapFormField.OutputAmount] = inputAmount || ''

      getInputQuantity()
    } else {
      formValues.value[SwapFormField.InputAmount] = outputAmount || ''

      getOutputQuantity()
    }
  }, 50)
}

async function getOutputQuantity() {
  formValues.value[SwapFormField.OutputAmount] = ''

  await nextTick()

  emit('reset:queryError')
  emit('update:outputQuantity')
}

async function getInputQuantity() {
  formValues.value[SwapFormField.InputAmount] = ''

  await nextTick()

  emit('reset:queryError')
  emit('update:inputQuantity')
}

function handleMaxUpdate({ amount }: { amount: string }) {
  formValues.value[SwapFormField.InputAmount] = amount

  getOutputQuantity()
}
</script>

<template>
  <div class="flex flex-col">
    <Transition name="fade-down" mode="out-in">
      <div :key="animationCount">
        <AppSelectToken
          v-model:denom="inputDenom"
          v-bind="{
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
          @update:max="handleMaxUpdate"
        >
          <span>{{ $t('trade.swap.youPay') }}</span>

          <template #error>
            <div
              class="flex flex-wrap items-center gap-1 text-sm whitespace-nowrap"
            ></div>
          </template>
        </AppSelectToken>
      </div>
    </Transition>

    <div class="my-4">
      <BaseIcon
        name="arrow"
        class="mx-auto min-w-6 w-6 h-6 transform -rotate-90"
        @click="handleSwap"
      />
    </div>

    <Transition name="fade-up" mode="out-in">
      <div :key="animationCount">
        <AppSelectToken
          v-model:denom="outputDenom"
          v-bind="{
            showUsd: true,
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

          <template #error>
            <div
              class="flex flex-wrap items-center gap-1 text-sm whitespace-nowrap"
            ></div>
          </template>
        </AppSelectToken>
      </div>
    </Transition>
  </div>
</template>
