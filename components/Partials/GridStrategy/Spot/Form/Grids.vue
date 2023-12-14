<script lang="ts" setup>
import { BigNumberInWei } from '@injectivelabs/utils'
import {
  GST_MINIMUM_GRIDS,
  GST_MAXIMUM_GRIDS,
  GST_DEFAULT_PRICE_TICK_SIZE
} from '@/app/utils/constants'
import { SpotGridTradingField } from '@/types'
import { KAVA_USDT_SYMBOL, STINJ_USDT_SYMBOL } from '@/app/data/token'

const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues()

const market = computed(() => gridStrategyStore.spotMarket)

const tickSize = computed(() =>
  market.value
    ? new BigNumberInWei(market.value.minPriceTickSize)
        .toBase(
          market.value.quoteToken.decimals - market.value.baseToken.decimals
        )
        .toFixed()
    : GST_DEFAULT_PRICE_TICK_SIZE
)

const marketUsesStableCoins = computed(() =>
  [
    gridStrategyStore.spotMarket?.baseToken.symbol,
    gridStrategyStore.spotMarket?.quoteToken.symbol
  ].some(
    (symbol) =>
      symbol &&
      [
        KAVA_USDT_SYMBOL.toLowerCase(),
        STINJ_USDT_SYMBOL.toLowerCase()
      ].includes(symbol.toLowerCase())
  )
)

const { value: gridsValue, errorMessage } = useStringField({
  name: SpotGridTradingField.Grids,
  rule: '',
  dynamicRule: computed(() => {
    const rules = ['requiredSgt']

    if (marketUsesStableCoins.value) {
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

    const betweenRule = `betweenSgt:${GST_MINIMUM_GRIDS},${GST_MAXIMUM_GRIDS}`

    rules.push(betweenRule)

    return rules.join('|')
  })
})
</script>

<template>
  <div class="pb-1">
    <p class="pb-3 font-bold text-sm tracking-wide flex items-center space-x-2">
      <span> 2. {{ $t('sgt.numberOfGrids') }} </span>
      <AppTooltip :content="$t('sgt.nOfGridsTooltip')" />
    </p>

    <AppInputNumeric
      v-model="gridsValue"
      :max-decimals="0"
      :placeholder="`${GST_MINIMUM_GRIDS} - ${GST_MAXIMUM_GRIDS}`"
      class="text-right"
    />

    <p class="text-red-500 text-xs font-semibold pt-2">{{ errorMessage }}</p>
  </div>
</template>
