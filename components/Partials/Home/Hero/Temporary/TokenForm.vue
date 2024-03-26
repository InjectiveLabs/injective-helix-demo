<script lang="ts" setup>
import { usdtToken, injToken } from '@/app/data/token'
import { SwapForm, SwapFormField } from '@/types'

const swapStore = useSwapStore()
const tokenStore = useTokenStore()
const formValues = useFormValues<SwapForm>()
const setFormValues = useSetFormValues()

const { accountBalancesWithToken } = useBalance()

const props = defineProps({
  isInputEntered: Boolean,
  hasUserInteraction: Boolean
})

const emit = defineEmits<{
  'form:reset': []
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

const { inputToken, outputToken } = useSwapHomepage(formValues)

const {
  inputDenomOptions,
  outputDenomOptions,
  selectorOutputDenom,
  selectorInputDenom
} = useSwapTokenSelectorHomepage({
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

  setFormValues(
    {
      [SwapFormField.InputDenom]: usdtToken.denom || route?.sourceDenom,
      [SwapFormField.OutputDenom]: injToken.denom || route?.targetDenom || '',
      [SwapFormField.InputAmount]: String(tokenStore.tokenUsdPrice(injToken)),
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
  const denomExistsInOptions = outputDenomOptions.value.some(
    (option) => option.denom === denom
  )

  setFormValues(
    {
      [SwapFormField.OutputDenom]: denomExistsInOptions
        ? denom
        : injToken.denom,
      [SwapFormField.InputDenom]: selectorInputDenom.value
    },
    false
  )

  if (!isUserInteraction.value) {
    const usdPrice = String(outputToken.value?.usdPrice || '')

    setFormValues(
      {
        [SwapFormField.InputAmount]: usdPrice
      },
      false
    )

    return
  }

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

  animationCount.value += 1
  emit('update:hasUserInteraction', true)

  setTimeout(
    () =>
      setFormValues(
        {
          [SwapFormField.InputAmount]: outputAmount,
          [SwapFormField.OutputAmount]: inputAmount
        },
        false
      ),
    50
  )
}

async function getOutputQuantity() {
  setFormValues(
    {
      [SwapFormField.OutputAmount]: ''
    },
    false
  )

  await nextTick()

  emit('update:outputQuantity')
  emit('update:hasUserInteraction', true)
}

async function getInputQuantity() {
  setFormValues({
    [SwapFormField.InputAmount]: ''
  })

  await nextTick()

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
            ...$attrs,
            debounce: 600,
            denom: inputDenom || usdtToken.denom,
            options: inputDenomOptions,
            amountFieldName: SwapFormField.InputAmount,
            maxDecimals: inputToken?.quantityDecimals || 0,
            isDisabled: [usdtToken.denom, injToken.denom].includes(
              inputToken?.denom || ''
            )
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
            ...$attrs,
            debounce: 600,
            denom: outputDenom || injToken.denom,
            options: outputDenomOptions,
            amountFieldName: SwapFormField.OutputAmount,
            maxDecimals: outputToken?.quantityDecimals || 0
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
