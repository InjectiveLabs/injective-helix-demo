<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_QUOTE_DECIMALS } from '@/app/utils/constants'
import { SwapForm, SwapFormField } from '@/types'
import { tokenToDecimalsOverrideMap } from '@/app/data/token'
import { SwapCyTags } from '@/enums'

const swapStore = useSwapStore()
const formValues = useFormValues<SwapForm>()

const props = defineProps({
  isLoading: Boolean
})

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
      <PartialsSwapSummaryRow :title="$t('trade.swap.route')">
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

      <PartialsSwapSummaryRow :title="$t('trade.swap.rate')">
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

      <PartialsSwapSummaryRow :title="$t('trade.swap.fees')">
        <span v-if="isEmptyForm">&mdash;</span>

        <PartialsSwapFees v-else />
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow
        v-if="swapStore.isInputEntered"
        :title="$t('trade.swap.minimumOutput')"
      >
        <span v-if="isEmptyForm">&mdash;</span>
        <span v-else :data-cy="dataCyTag(SwapCyTags.SwapSummaryMinOutput)">
          {{ minimumOutput }} {{ outputToken?.token.symbol }}
        </span>
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow v-else :title="$t('trade.swap.maximumInput')">
        <span v-if="isEmptyForm">&mdash;</span>
        <span v-else> {{ maximumInput }} {{ inputToken?.token.symbol }} </span>
      </PartialsSwapSummaryRow>

      <PartialsSwapSummaryRow :title="$t('trade.swap.expectedOutput')">
        <span v-if="isEmptyForm">&mdash;</span>
        <span v-else :data-cy="dataCyTag(SwapCyTags.SwapSummaryExpectedOutput)">
          {{ formValues[SwapFormField.OutputAmount] }}
          {{ outputToken?.token.symbol }}
        </span>
      </PartialsSwapSummaryRow>
    </div>
  </div>
</template>
