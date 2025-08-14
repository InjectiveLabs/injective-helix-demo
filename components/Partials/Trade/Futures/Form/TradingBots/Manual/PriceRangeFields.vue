<script setup lang="ts">
import { MarketKey, DerivativeGridTradingField } from '@/types'
import type { UiDerivativeMarket } from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const { markPrice } = useDerivativeLastPrice(market)

const { value: upperPriceValue, errorMessage: upperErrorMessage } =
  useStringField({
    name: DerivativeGridTradingField.UpperPrice,
    rule: '',
    dynamicRule: computed(() => {
      const greaterThanRule = `greaterThanSgt:${markPrice.value}`

      const rules = [greaterThanRule]

      return rules.join('|')
    })
  })

const { value: lowerPriceValue, errorMessage: lowerErrorMessage } =
  useStringField({
    name: DerivativeGridTradingField.LowerPrice,
    rule: '',
    dynamicRule: computed(() => {
      const lessThanRule = `lessThanSgt:${markPrice.value}`
      const greaterThanRule = `greaterThanSgt:${0}`

      const rules = [greaterThanRule, lessThanRule]

      return rules.join('|')
    })
  })
</script>

<template>
  <div>
    <div class="space-y-4 mb-4">
      <p class="field-label">1. {{ $t('tradingBots.priceRange') }}</p>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <p class="text-xs text-coolGray-400">{{ $t('tradingBots.lower') }}</p>
          <AppInputField v-model="lowerPriceValue" placeholder="0.00" />
          <p v-if="lowerErrorMessage" class="error-message">
            {{ lowerErrorMessage }}
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-xs text-coolGray-400">{{ $t('tradingBots.upper') }}</p>
          <AppInputField v-model="upperPriceValue" placeholder="0.00" />
          <p v-if="upperErrorMessage" class="error-message">
            {{ upperErrorMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
