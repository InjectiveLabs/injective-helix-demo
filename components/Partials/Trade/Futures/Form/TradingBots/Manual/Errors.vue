<script setup lang="ts">
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativeGridTradingForm
} from '@/types'
import { GST_MAXIMUM_GRIDS, GST_MINIMUM_GRIDS } from '@/app/utils/constants'
import { calculateLeverage } from '@/app/utils/formatters'
import { validateTickSize } from '@/app/utils/pgt'

withDefaults(
  defineProps<{
    error: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  'update:error': [boolean]
}>()

const formValues = useFormValues<DerivativeGridTradingForm>()
const futuresMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const errors = computed(() => {
  const { grids, leverage, lowerPrice, margin, upperPrice } = formValues.value
  const errors = []

  if (margin && grids && leverage && lowerPrice && upperPrice) {
    const {
      isValid,
      gridReductionNeeded,
      additionalAmountNeeded,
      leverageIncreaseNeeded
    } = validateTickSize({
      amount: Number(margin),
      leverage: Number(leverage),
      numberOfGrids: Number(grids),
      upperPrice: Number(upperPrice),
      marketMinTickSize: futuresMarket.value.minQuantityTickSize,
      minGridLevels: GST_MINIMUM_GRIDS,
      maxGridLevels: GST_MAXIMUM_GRIDS,
      minLeverage: 1,
      maxLeverage: calculateLeverage(
        futuresMarket.value.initialMarginRatio
      ).toNumber()
    })

    if (isValid) {
      return false
    }

    if (additionalAmountNeeded > 0) {
      const amount = additionalAmountNeeded + Number(margin)

      errors.push(
        `Add funds to reach a minimum of: ${amount.toFixed(3)} ${
          futuresMarket.value.quoteToken.symbol
        }`
      )
    }

    if (leverageIncreaseNeeded > 0) {
      const newLeverage = Number(leverage) + leverageIncreaseNeeded

      errors.push(`Increase leverage above: ${newLeverage.toFixed(2)}x`)
    }

    if (gridReductionNeeded > 0) {
      const newGrids = Number(grids) - gridReductionNeeded

      errors.push(`Reduce the number of grids to: ${newGrids}`)
    }

    return errors
  }

  return false
})

watch(errors, (errors) => {
  emit('update:error', !!errors)
})
</script>

<template>
  <div v-if="errors" class="text-red-500 text-xs">
    <p>Order size too small. Adjust settings with one of these options:</p>
    <ul>
      <li
        v-for="errorMessage in errors"
        :key="errorMessage"
        class="list-disc list-inside"
      >
        {{ errorMessage }}
      </li>
    </ul>
  </div>
</template>
