<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  GST_MINIMUM_GRIDS,
  GST_MAXIMUM_GRIDS,
  GST_DEFAULT_PRICE_TICK_SIZE
} from '@/app/utils/constants'
import { SpotGridTradingField } from '@/types'
import { KAVA_USDT_SYMBOL } from '@/app/data/token'

const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues()

const market = computed(() => gridStrategyStore.spotMarket)

const tickSize = computed(() =>
  gridStrategyStore.spotMarket
    ? new BigNumberInWei(gridStrategyStore.spotMarket.minPriceTickSize)
        .toBase(
          gridStrategyStore.spotMarket.quoteToken.decimals -
            gridStrategyStore.spotMarket.baseToken.decimals
        )
        .toFixed()
    : GST_DEFAULT_PRICE_TICK_SIZE
)

const maximumGrids = computed(() => {
  const range = new BigNumberInBase(
    formValues.value[SpotGridTradingField.UpperPrice]
  ).minus(formValues.value[SpotGridTradingField.LowerPrice])

  const maximumGrids = range.dividedBy(Number(tickSize.value) * 10).toFixed(0)

  if (Number(maximumGrids) < GST_MINIMUM_GRIDS) {
    return GST_MINIMUM_GRIDS
  }

  if (Number(maximumGrids) > GST_MAXIMUM_GRIDS) {
    return GST_MAXIMUM_GRIDS
  }

  return Number(maximumGrids)
})

const { value: gridsValue, errorMessage } = useStringField({
  name: SpotGridTradingField.Grids,
  rule: '',
  dynamicRule: computed(() => {
    const rules = ['requiredSgt']

    const marketUsesKavaUsdt = [
      market.value?.baseToken.symbol,
      market.value?.quoteToken.symbol
    ].some(
      (symbol) =>
        symbol && symbol.toLowerCase() === KAVA_USDT_SYMBOL.toLowerCase()
    )

    const betweenRule = `betweenSgt:${GST_MINIMUM_GRIDS},${maximumGrids.value}`

    if (marketUsesKavaUsdt) {
      const rangeKavaRule = `rangeKavaSgt:@${
        SpotGridTradingField.LowerPrice
      },@${SpotGridTradingField.UpperPrice},${
        formValues.value[SpotGridTradingField.Grids] || GST_MINIMUM_GRIDS
      },${tickSize.value}`

      rules.push(rangeKavaRule)
    } else {
      const rangeRule = `rangeSgt:@${SpotGridTradingField.LowerPrice},@${
        SpotGridTradingField.UpperPrice
      },${formValues.value[SpotGridTradingField.Grids] || GST_MINIMUM_GRIDS},${
        tickSize.value
      }`

      rules.push(rangeRule)
    }

    rules.push(betweenRule)

    return rules.join('|')
  })
})
</script>
<template>
  <div class="pb-1">
    <p class="pb-3 font-bold text-sm tracking-wide flex items-center space-x-2">
      <span>{{ $t('sgt.numberOfGrids') }} </span>
      <AppTooltip :content="$t('sgt.nOfGridsTooltip')" />
    </p>

    <AppInputNumeric
      v-model="gridsValue"
      :max-decimals="0"
      :placeholder="`${GST_MINIMUM_GRIDS} - ${maximumGrids.toFixed(0)}`"
      class="text-right"
    />

    <p class="text-red-500 text-xs font-semibold pt-2">{{ errorMessage }}</p>
  </div>
</template>
