<script lang="ts" setup>
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { SwapForm, SwapFormField } from '@/types'

const tokenStore = useTokenStore()
const swapFormValues = useFormValues<SwapForm>()
const { inputToken, outputToken } = useSwap(swapFormValues)

const SLIPPAGE = 15

const inputAmountUsd = computed(() => {
  if (!inputToken.value) {
    return new BigNumberInBase(0)
  }

  const inputAmount = new BigNumberInBase(
    swapFormValues.value[SwapFormField.InputAmount] || 0
  )

  return inputAmount.multipliedBy(
    tokenStore.tokenUsdPrice(inputToken.value.token)
  )
})

const outputAmountUsd = computed(() => {
  if (!outputToken.value) {
    return new BigNumberInBase(0)
  }

  const outputAmount = new BigNumberInBase(
    swapFormValues.value[SwapFormField.OutputAmount] || 0
  )

  return outputAmount.multipliedBy(
    tokenStore.tokenUsdPrice(outputToken.value.token)
  )
})

const slippage = computed(() => {
  const lesserAmount = BigNumber.min(
    inputAmountUsd.value,
    outputAmountUsd.value
  )
  const greaterAmount = BigNumber.max(
    inputAmountUsd.value,
    outputAmountUsd.value
  )

  return new BigNumberInBase(100).minus(
    lesserAmount.dividedBy(greaterAmount).multipliedBy(100)
  )
})
</script>

<template>
  <article
    v-if="
      slippage.gt(SLIPPAGE) &&
      !inputAmountUsd.isZero() &&
      !outputAmountUsd.isZero()
    "
    class="bg-red-500 bg-opacity-10 p-4 rounded-lg mb-6"
  >
    <p class="text-sm text-red-500 leading-4">
      {{ $t('trade.swap.priceWarning', { symbol: outputToken?.token.symbol }) }}
    </p>
  </article>
</template>
