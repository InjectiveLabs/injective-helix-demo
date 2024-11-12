<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  LiquidityBotField,
  LiquidityBotForm,
  LiquidityValues,
  UiMarketWithToken,
  UiSpotMarket
} from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
  }>(),
  {}
)

const gridStrategyStore = useGridStrategyStore()
const validate = useValidateForm<LiquidityBotForm>()
const formErrors = useFormErrors<LiquidityBotForm>()
const liquidityFormValues = useFormValues<LiquidityBotForm>()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

async function createLiquidityBot() {
  const { valid } = await validate()

  if (
    (!liquidityFormValues.value.baseAmount &&
      !liquidityFormValues.value.quoteAmount) ||
    !valid
  ) {
    return
  }

  status.setLoading()

  const {
    grids,
    lowerBound,
    upperBound,
    trailingLowerBound,
    trailingUpperBound
  } = props.liquidityValues

  gridStrategyStore
    .createSpotLiquidityBot({
      market: props.market as UiSpotMarket,
      grids,
      lowerBound: lowerBound.toFixed(),
      upperBound: upperBound.toFixed(),
      upperTrailingBound: trailingUpperBound.toFixed(),
      lowerTrailingBound: trailingLowerBound.toFixed(),
      baseAmount: liquidityFormValues.value[LiquidityBotField.BaseAmount],
      quoteAmount: liquidityFormValues.value[LiquidityBotField.QuoteAmount]
    })
    .then(() => {
      status.setIdle()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <UButton
    :disabled="Object.keys(formErrors).length > 0"
    :loading="status.isLoading()"
    :variant="Object.keys(formErrors).length > 0 ? 'outline' : 'solid'"
    block
    @click="createLiquidityBot"
  >
    {{ $t('liquidityBots.createBot') }}
  </UButton>
</template>
