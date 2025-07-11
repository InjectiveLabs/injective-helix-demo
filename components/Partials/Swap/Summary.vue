<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { tokenToDecimalsOverrideMap } from '@/app/data/token'
import {
  MAX_QUOTE_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { SwapCyTags, SwapFormField } from '@/types'
import type { SwapForm } from '@/types'

const swapStore = useSwapStore()
const formValues = useFormValues<SwapForm>()

const props = withDefaults(
  defineProps<{
    isLoading?: boolean
  }>(),
  {
    isLoading: false
  }
)

const {
  maximumInput,
  minimumOutput,
  inputToken,
  outputToken,
  orderedRouteTokensAndDecimals
} = useSwap(formValues)

const isEmptyForm = computed(() => {
  return (
    new BigNumberInBase(formValues.value[SwapFormField.InputAmount] || 0).lte(
      0
    ) ||
    new BigNumberInBase(formValues.value[SwapFormField.OutputAmount] || 0).lte(
      0
    ) ||
    props.isLoading
  )
})

const priceForDisplayToFormat = computed(() => {
  const decimals =
    tokenToDecimalsOverrideMap[inputToken.value?.token.symbol || ''] ||
    inputToken.value?.quantityDecimals

  return new BigNumberInBase(formValues.value[SwapFormField.InputAmount] || 1)
    .dividedBy(formValues.value[SwapFormField.OutputAmount] || 1)
    .toFixed(decimals || MAX_QUOTE_DECIMALS)
})

const routeSymbols = computed(() =>
  orderedRouteTokensAndDecimals.value.map(({ token }) => token.symbol)
)

defineExpose({
  priceForDisplayToFormat
})
</script>

<template>
  <div>
    <div class="space-y-3">
      <PartialsSwapSummaryRow :title="$t('swap.route')">
        <span v-if="orderedRouteTokensAndDecimals?.length === 0">
          &mdash;
        </span>
        <div
          v-else
          class="flex items-center gap-1 justify-end"
          :data-cy="dataCyTag(SwapCyTags.SwapSummaryRoute)"
        >
          <PartialsSwapRoute
            v-bind="{
              routeSymbols
            }"
          />
        </div>
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow :title="$t('swap.rate')">
        <span v-if="isEmptyForm">&mdash;</span>
        <div
          v-else-if="orderedRouteTokensAndDecimals && inputToken && outputToken"
        >
          <span
            :data-cy="`${dataCyTag(SwapCyTags.SwapSummaryRate)}-${
              outputToken.token.symbol
            }`"
          >
            1 {{ outputToken.token.symbol }}
          </span>
          =
          <span
            :data-cy="`${dataCyTag(SwapCyTags.SwapSummaryRate)}-${
              inputToken.token.symbol
            }`"
          >
            {{ priceForDisplayToFormat }}
            {{ inputToken.token.symbol }}
          </span>
        </div>
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow :title="$t('swap.fees')">
        <span v-if="isEmptyForm">&mdash;</span>

        <PartialsSwapFees v-else />
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow
        v-if="swapStore.isInputEntered"
        :title="$t('swap.minimumOutput')"
      >
        <span v-if="isEmptyForm">&mdash;</span>
        <span v-else :data-cy="dataCyTag(SwapCyTags.SwapSummaryMinOutput)">
          <SharedAmountFormatter
            :amount="minimumOutput"
            :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
          />
          {{ outputToken?.token.symbol }}
        </span>
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow v-else :title="$t('swap.maximumInput')">
        <span v-if="isEmptyForm">&mdash;</span>
        <span v-else>
          <SharedAmountFormatter
            :amount="maximumInput"
            :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
          />
          {{ inputToken?.token.symbol }}
        </span>
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow :title="$t('swap.expectedOutput')">
        <span v-if="isEmptyForm">&mdash;</span>
        <span v-else :data-cy="dataCyTag(SwapCyTags.SwapSummaryExpectedOutput)">
          <SharedAmountFormatter
            :amount="formValues[SwapFormField.OutputAmount] || '0'"
            :decimal-places="UI_DEFAULT_DISPLAY_DECIMALS"
            :max-decimal-places="3"
          />
          {{ outputToken?.token.symbol }}
        </span>
      </PartialsSwapSummaryRow>
    </div>
  </div>
</template>
