<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SpotGridTradingForm } from '@/types'

const gridStrategyStore = useGridStrategyStore()
const tokenStore = useTokenStore()
const formValues = useFormValues<SpotGridTradingForm>()

const profitPerGrid = computed(() => {
  if (
    !formValues.value.lowerPrice ||
    !formValues.value.upperPrice ||
    !formValues.value.grids ||
    !formValues.value.investmentAmount ||
    !gridStrategyStore.spotMarket ||
    Number(formValues.value.grids) === 0
  ) {
    return ZERO_IN_BASE
  }

  // We get wrong values in testnet
  const quotePriceInUsd = new BigNumberInBase(
    tokenStore.tokenUsdPriceMap[
      gridStrategyStore.spotMarket.baseToken.coinGeckoId
    ]
  )

  return new BigNumberInBase(
    Number(formValues.value.upperPrice) - Number(formValues.value.lowerPrice)
  )
    .dividedBy(formValues.value.grids)
    .dividedBy(quotePriceInUsd.dividedBy(formValues.value.investmentAmount))
})

const { valueToString: profitPerGridToString } = useBigNumberFormatter(
  profitPerGrid,
  { decimalPlaces: 2 }
)
</script>

<template>
  <div class="flex justify-between items-center border-b py-4 text-gray-500">
    <p>{{ $t('sgt.profitPerGrid') }}</p>
    <p>
      {{ profitPerGridToString }}
      {{ gridStrategyStore.spotMarket?.quoteToken.symbol }}
    </p>
  </div>
</template>
