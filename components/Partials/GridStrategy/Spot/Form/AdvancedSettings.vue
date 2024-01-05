<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { SpotGridTradingField } from '@/types'

const gridStrategyStore = useGridStrategyStore()

const isOpen = ref(false)
const isTpSlOpen = ref(false)

const market = computed(
  () => gridStrategyStore.spotMarket as UiSpotMarketWithToken
)

const { value: stopLossValue, errorMessage: stopLossError } = useStringField({
  name: SpotGridTradingField.StopLoss,
  rule: `lessThanSgt:@${SpotGridTradingField.LowerPrice}`
})

const { value: takeProfitValue, errorMessage: takeProfitError } =
  useStringField({
    name: SpotGridTradingField.TakeProfit,
    rule: `greaterThanSgt:@${SpotGridTradingField.UpperPrice}`
  })

const { value: SellBaseUponTerminationValue } = useBooleanField({
  name: SpotGridTradingField.SellBaseUponTermination,
  rule: ''
})

const { value: SellBaseOnStopLossValue } = useBooleanField({
  name: SpotGridTradingField.SellBaseOnStopLoss,
  rule: ''
})

const { value: BuyBaseOnTakeProfitValue } = useBooleanField({
  name: SpotGridTradingField.BuyBaseOnTakeProfit,
  rule: ''
})

function toggleAdvancedSettings() {
  isOpen.value = !isOpen.value
}

watch(isTpSlOpen, () => {
  SellBaseOnStopLossValue.value = false
  BuyBaseOnTakeProfitValue.value = false
  takeProfitValue.value = ''
  stopLossValue.value = ''
})
</script>
<template>
  <div
    class="flex justify-between items-center select-none"
    @click="toggleAdvancedSettings"
  >
    <p class="font-semibold text-sm">{{ $t('sgt.advancedSettings') }}</p>
    <div class="transition-all duration-300" :class="{ 'rotate-180': isOpen }">
      <BaseIcon name="chevron-down" is-md />
    </div>
  </div>

  <div v-if="isOpen">
    <div class="mb-6 space-y-2">
      <div>
        <AppCheckbox v-model="SellBaseUponTerminationValue">
          {{
            $t('sgt.advanced.sellBaseUponTermination', {
              base: market.baseToken.symbol
            })
          }}
        </AppCheckbox>
      </div>

      <div>
        <AppCheckbox v-model="isTpSlOpen"> TP/SL </AppCheckbox>
      </div>
    </div>

    <div v-if="isTpSlOpen">
      <p class="font-semibold text-sm mb-2">{{ $t('sgt.stopTrigger') }}</p>

      <div class="mb-3">
        <AppInputNumeric
          v-model="stopLossValue"
          :placeholder="$t('sgt.stopLoss')"
        />

        <p v-if="stopLossError" class="mt-2 text-red-500 text-xs font-semibold">
          {{ stopLossError }}
        </p>
      </div>

      <div class="mb-6">
        <AppCheckbox
          v-model="SellBaseOnStopLossValue"
          v-bind="{ isDisabled: !stopLossValue }"
        >
          {{
            $t('sgt.advanced.sellAllOnStop', {
              symbol: market.baseToken.symbol
            })
          }}
        </AppCheckbox>
      </div>

      <div class="mb-3">
        <AppInputNumeric
          v-model="takeProfitValue"
          :placeholder="$t('sgt.takeProfit')"
        />

        <p
          v-if="takeProfitError"
          class="mt-2 text-red-500 text-xs font-semibold"
        >
          {{ takeProfitError }}
        </p>
      </div>

      <div>
        <AppCheckbox
          v-model="BuyBaseOnTakeProfitValue"
          v-bind="{ isDisabled: !takeProfitValue }"
        >
          {{
            $t('sgt.advanced.sellAllOnStop', {
              symbol: market.baseToken.symbol
            })
          }}
        </AppCheckbox>
      </div>
    </div>
  </div>
</template>
