<script setup lang="ts">
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativesTradeForm,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const { value: reduceOnly } = useBooleanField({
  name: DerivativesTradeFormField.ReduceOnly,
  initialValue: false,
  rule: ''
})

const positionStore = usePositionStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const position = computed(() =>
  positionStore.subaccountPositions.find(
    (position) => position.marketId === derivativeMarket?.value?.marketId
  )
)

const disabled = computed(
  () =>
    !position.value ||
    position.value.direction ===
      derivativeFormValues.value[DerivativesTradeFormField.Side]
)

watchEffect(() => {
  if (disabled.value) {
    reduceOnly.value = false
  }
})
</script>

<template>
  <div>
    <AppCheckbox
      v-bind="{ disabled }"
      v-model="reduceOnly"
      class="text-white"
      :data-cy="dataCyTag(PerpetualMarketCyTags.AdvancedSettingsReduceOnlyCheckbox)"
    >
      {{ $t('trade.reduceOnly') }}
    </AppCheckbox>
  </div>
</template>
