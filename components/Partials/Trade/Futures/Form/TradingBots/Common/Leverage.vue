<script setup lang="ts">
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketKey,
  DerivativeGridTradingField,
  UiDerivativeMarket
} from '@/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const { value: leverageValue } = useStringField({
  name: DerivativeGridTradingField.Leverage,
  rule: '',
  initialValue: '1',
  dynamicRule: computed(() => `requiredSgt`)
})

const maxLeverage = computed(() => {
  return new BigNumberInBase(1)
    .div(market.value.initialMarginRatio)
    .dp(0, BigNumber.ROUND_DOWN)
})

const leverage = ref(1)

watch(
  leverage,
  (leverage) => {
    if (leverage === 0) {
      leverageValue.value = '1'
      return
    }

    leverageValue.value = new BigNumberInBase(1)
      .div(leverage)
      .dp(UI_DEFAULT_DISPLAY_DECIMALS)
      .toFixed()
  },
  { immediate: true }
)
</script>

<template>
  <div class="pt-4">
    <div>
      <h3 class="text-xs text-coolGray-400">
        {{ $t('trade.max_leverage', { max: maxLeverage }) }}
      </h3>
    </div>

    <div class="flex items-center gap-2">
      <URange
        v-model="leverage"
        :min="1"
        :max="maxLeverage.toNumber()"
        :step="0.01"
      />

      <div
        class="bg-brand-850 border border-coolGray-700 px-2 py-1 rounded-md flex"
      >
        <p class="w-12">{{ leverage }}</p>
        <span>x</span>
      </div>
    </div>
  </div>
</template>
