<script setup lang="ts">
import { MarketKey, SpotGridTradingField } from '@/types'
import type { UiSpotMarket, SpotGridTradingForm } from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const spotGridFormValues = useFormValues<SpotGridTradingForm>()

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: SpotGridTradingField.TakeProfit,
    rule: '',
    dynamicRule: computed(() => {
      const minValueRule = `greaterThanSgt:${
        spotGridFormValues.value[SpotGridTradingField.UpperPrice]
      }`

      return minValueRule
    })
  })

const { value: stopLossValue, errorMessage: stopLossErrorMessage } =
  useStringField({
    name: SpotGridTradingField.StopLoss,
    rule: '',
    dynamicRule: computed(() => {
      const maxValueRule = `lessThanSgt:${
        spotGridFormValues.value[SpotGridTradingField.LowerPrice]
      }`

      return maxValueRule
    })
  })

const { value: buyBaseOnTakeProfitValue } = useBooleanField({
  name: SpotGridTradingField.BuyBaseOnTakeProfit,
  initialValue: false,
  rule: ''
})

const { value: sellBaseOnStopLossValue } = useBooleanField({
  name: SpotGridTradingField.SellBaseOnStopLoss,
  initialValue: false,
  rule: ''
})
</script>

<template>
  <div class="p-1 space-y-4">
    <div class="flex items-center gap-2">
      <p class="text-xs text-coolGray-450">
        {{ $t('tradingBots.upperPriceStop') }}
      </p>
      <AppTooltip :text="$t('tradingBots.sgt.upperPriceStopTooltip')" />
    </div>

    <AppInputField
      v-model="takeProfitValue"
      :placeholder="$t('tradingBots.upperPriceStop')"
      class="placeholder:font-sans"
    />
    <p v-if="takeProfitErrorMessage" class="error-message">
      {{ takeProfitErrorMessage }}
    </p>

    <div class="!mt-2 !-mb-2">
      <AppCheckbox
        v-model="buyBaseOnTakeProfitValue"
        class="!mt-2 !-mb-2 text-coolGray-450 font-medium"
      >
        {{
          $t('tradingBots.buySymbolOnStop', { symbol: market.baseToken.symbol })
        }}
      </AppCheckbox>
    </div>

    <div class="flex items-center gap-2">
      <p class="text-xs text-coolGray-450">
        {{ $t('tradingBots.lowerPriceStop') }}
      </p>
      <AppTooltip :text="$t('tradingBots.sgt.lowerPriceStopTooltip')" />
    </div>

    <AppInputField
      v-model="stopLossValue"
      :placeholder="$t('tradingBots.lowerPriceStop')"
      class="placeholder:font-sans"
    />

    <p v-if="stopLossErrorMessage" class="error-message">
      {{ stopLossErrorMessage }}
    </p>

    <div class="!mt-2 !-mb-2 text-coolGray-450 font-medium">
      <AppCheckbox v-model="sellBaseOnStopLossValue">
        {{
          $t('tradingBots.sellAllSymbolOnStop', {
            symbol: market.baseToken.symbol
          })
        }}
      </AppCheckbox>
    </div>
  </div>
</template>
