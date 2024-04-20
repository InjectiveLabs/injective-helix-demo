<script lang="ts" setup>
import { Modal, SwapForm, SwapFormField } from '@/types'
import { TokenSymbols } from '@/app/data/token'

const swapStore = useSwapStore()
const walletStore = useWalletStore()
const formValues = useFormValues<SwapForm>()
const setFormValues = useSetFormValues()
const { query } = useRoute()
const { accountBalancesWithToken } = useBalance()

const emit = defineEmits<{
  'form:reset': []
  'queryError:reset': []
  'update:inputQuantity': []
  'update:outputQuantity': []
}>()

const animationCount = ref(0)

const SHOULD_DISABLE_QUOTE_BASE_DENOM_LIST = [
  'factory/inj1maeyvxfamtn8lfyxpjca8kuvauuf2qeu6gtxm3/Talis'
]

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

const outputIsDisabledBaseDenom = computed(() =>
  SHOULD_DISABLE_QUOTE_BASE_DENOM_LIST.includes(outputDenom.value)
)

const shouldDisableQuoteToken = computed(() =>
  SHOULD_DISABLE_QUOTE_BASE_DENOM_LIST.some((denom) =>
    [inputDenom.value, outputDenom.value].includes(denom)
  )
)

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

  setFormValues({
    [SwapFormField.InputDenom]: usdtToken?.denom || route?.sourceDenom || '',
    [SwapFormField.OutputDenom]: injToken?.denom || route?.targetDenom || ''
  })

  if (Object.keys(query).length !== 0) {
    modifyFormFromQuery()
  }
})

function modifyFormFromQuery() {
  const { to, from, toAmount, fromAmount } = query

  if (to && from) {
    setFormValues({
      [SwapFormField.InputDenom]: from as string,
      [SwapFormField.OutputDenom]: to as string
    })
  }

  if (fromAmount) {
    setFormValues({
      [SwapFormField.InputAmount]: fromAmount as string
    })

    getOutputQuantity()
  } else if (toAmount) {
    setFormValues({
      [SwapFormField.OutputAmount]: toAmount as string
    })

    getInputQuantity()
  }
}

function onInputDenomChange() {
  setFormValues({
    [SwapFormField.OutputDenom]: selectorOutputDenom.value
  })

  emit('form:reset')
}

function onOutputDenomChange() {
  setFormValues({
    [SwapFormField.InputDenom]: selectorInputDenom.value
  })

  emit('form:reset')
}

function swap() {
  const {
    [SwapFormField.InputDenom]: inputDenom,
    [SwapFormField.OutputDenom]: outputDenom,
    [SwapFormField.InputAmount]: inputAmount,
    [SwapFormField.OutputAmount]: outputAmount
  } = formValues.value

  setFormValues({
    [SwapFormField.InputDenom]: outputDenom,
    [SwapFormField.OutputDenom]: inputDenom
  })

  animationCount.value = animationCount.value + 1

  setTimeout(() => {
    /**
     * We check whether user entered a value in the top or bottom input field
     * Since they will want to retain that value when swapping
     * Then, we query swap SC for the opposing input field's value
     **/
    if (swapStore.isInputEntered) {
      setFormValues({
        [SwapFormField.OutputAmount]: inputAmount || ''
      })

      getInputQuantity()
    } else {
      setFormValues({
        [SwapFormField.InputAmount]: outputAmount || ''
      })

      getOutputQuantity()
    }
  }, 50)
}

async function getOutputQuantity() {
  setFormValues({
    [SwapFormField.OutputAmount]: ''
  })

  await nextTick()

  emit('queryError:reset')
  emit('update:outputQuantity')
}

async function getInputQuantity() {
  setFormValues({
    [SwapFormField.InputAmount]: ''
  })

  await nextTick()

  emit('queryError:reset')
  emit('update:inputQuantity')
}

function onMaxSelected({ amount }: { amount: string }) {
  setFormValues({
    [SwapFormField.InputAmount]: amount
  })

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
            isDisabled: shouldDisableQuoteToken && outputIsDisabledBaseDenom,
            isMaxHidden: false,
            isUsdVisible: !!inputToken?.token.coinGeckoId,
            shouldCheckBalance: true,
            options: inputDenomOptions,
            modal: Modal.TokenSelectorFrom,
            amountFieldName: SwapFormField.InputAmount,
            maxDecimals: inputToken?.quantityDecimals || 0,
            tensMultiplier: inputToken?.tensMultiplier ?? undefined,
            hideBalance: !walletStore.isUserWalletConnected
          }"
          @update:max="onMaxSelected"
          @update:amount="getOutputQuantity"
          @update:denom="onInputDenomChange"
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

    <div>
      <BaseIcon
        name="arrow"
        class="mx-auto min-w-6 w-10 h-10 -rotate-90 border p-2 rounded-full -my-3 bg-brand-900 border-brand-700 z-20 relative hover:scale-110 transition-transform"
        @click="swap"
      />
    </div>

    <Transition name="fade-up" mode="out-in">
      <div :key="animationCount">
        <AppSelectToken
          v-model:denom="outputDenom"
          v-bind="{
            debounce: 600,
            isMaxHidden: true,
            isDisabled: shouldDisableQuoteToken && !outputIsDisabledBaseDenom,
            isUsdVisible: !!outputToken?.token.coinGeckoId,
            options: outputDenomOptions,
            modal: Modal.TokenSelectorTo,
            amountFieldName: SwapFormField.OutputAmount,
            maxDecimals: outputToken?.quantityDecimals || 0,
            tensMultiplier: outputToken?.tensMultiplier ?? undefined,
            hideBalance: !walletStore.isUserWalletConnected
          }"
          @update:amount="getInputQuantity"
          @update:denom="onOutputDenomChange"
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
