<script lang="ts" setup>
import { SwapForm, SwapFormField } from '@/types'

const swapStore = useSwapStore()
const tokenStore = useTokenStore()
const spotStore = useSpotStore()
const formValues = useFormValues<SwapForm>()
const setFormValues = useSetFormValues()

const { accountBalancesWithToken } = useBalance()

const props = defineProps({
  isDisabled: Boolean,
  hasUserInteraction: Boolean
})

const emit = defineEmits<{
  'form:reset': []
  'queryError:reset': []
  'update:inputQuantity': []
  'update:outputQuantity': []
  'update:hasUserInteraction': [state: boolean]
}>()

const animationCount = ref(0)

const { value: inputDenom } = useStringField({
  name: SwapFormField.InputDenom
})

const { value: outputDenom } = useStringField({
  name: SwapFormField.OutputDenom
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

  setFormValues(
    {
      [SwapFormField.InputDenom]: peggyUsdToken?.denom || route?.sourceDenom,
      [SwapFormField.OutputDenom]: injToken?.denom || route?.targetDenom || '',
      [SwapFormField.InputAmount]: injToken
        ? String(tokenStore.tokenUsdPrice(injToken))
        : '0',
      [SwapFormField.OutputAmount]: '1'
    },
    false
  )
})

function inputDenomChange(denom: string) {
  setFormValues(
    {
      [SwapFormField.InputDenom]: denom,
      [SwapFormField.OutputDenom]: selectorOutputDenom.value
    },
    false
  )

  if (isUserInteraction.value) {
    emit('update:hasUserInteraction', isUserInteraction.value)
    emit('form:reset')
  }
}

function outputDenomChange(denom: string) {
  setFormValues(
    {
      [SwapFormField.OutputDenom]: denom,
      [SwapFormField.InputDenom]: selectorInputDenom.value
    },
    false
  )

  emit('form:reset')
}

function swap() {
  const {
    [SwapFormField.InputDenom]: inputDenom,
    [SwapFormField.OutputDenom]: outputDenom,
    [SwapFormField.InputAmount]: inputAmount,
    [SwapFormField.OutputAmount]: outputAmount
  } = formValues.value

  setFormValues(
    {
      [SwapFormField.InputDenom]: outputDenom,
      [SwapFormField.OutputDenom]: inputDenom
    },
    false
  )

  animationCount.value = animationCount.value + 1

  setTimeout(() => {
    /**
     * We check whether user entered a value in the top or bottom input field
     * Since they will want to retain that value when swapping
     * Then, we query swap SC for the opposing input field's value
     **/
    if (!swapStore.isInputEntered || isUserInteraction.value) {
      setFormValues({
        [SwapFormField.InputAmount]: outputAmount || ''
      })

      getOutputQuantity()
    } else {
      setFormValues({
        [SwapFormField.OutputAmount]: inputAmount || ''
      })

      getInputQuantity()
    }

    emit('update:hasUserInteraction', true)
  }, 50)
}

async function getOutputQuantity() {
  setFormValues(
    {
      [SwapFormField.OutputAmount]: ''
    },
    false
  )

  await nextTick()

  emit('queryError:reset')
  emit('update:outputQuantity')
  emit('update:hasUserInteraction', true)
}

async function getInputQuantity() {
  setFormValues({
    [SwapFormField.InputAmount]: ''
  })

  await nextTick()

  emit('queryError:reset')
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
            disabled: isDisabled,
            denom: inputDenom,
            debounce: 600,
            options: inputDenomOptions,
            maxDecimals: inputToken?.quantityDecimals || 0,
            amountFieldName: SwapFormField.InputAmount
          }"
          @update:denom="inputDenomChange"
          @update:amount="getOutputQuantity"
        >
          <span>{{ $t('trade.swap.youPay') }}</span>
        </PartialsHomeHeroTemporarySelectToken>
      </div>
    </Transition>

    <div class="my-4">
      <BaseIcon
        name="arrow"
        class="mx-auto min-w-6 w-6 h-6 -rotate-90 text-black"
        @click="swap"
      />
    </div>

    <Transition name="fade-up" mode="out-in">
      <div :key="animationCount">
        <PartialsHomeHeroTemporarySelectToken
          v-model:is-user-interaction="isUserInteraction"
          v-bind="{
            disabled: isDisabled,
            denom: outputDenom,
            debounce: 600,
            options: outputDenomOptions,
            maxDecimals: outputToken?.quantityDecimals || 0,
            amountFieldName: SwapFormField.OutputAmount
          }"
          @update:denom="outputDenomChange"
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
