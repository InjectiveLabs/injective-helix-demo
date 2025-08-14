<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketKey,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const { value: reduceOnly } = useBooleanField({
  name: DerivativesTradeFormField.ReduceOnly,
  initialValue: false,
  rule: ''
})

const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const position = computed(() =>
  positionStore.subaccountPositions.find(
    (position) => position.marketId === derivativeMarket?.value?.marketId
  )
)

const disabled = computed(() => {
  const positionQuantity = position.value?.quantity || 0

  const reduceOnlyOrderAmount = derivativeStore.subaccountOrders.reduce(
    (sum, order) => {
      return order.isReduceOnly &&
        order.marketId === derivativeMarket.value.marketId
        ? sum.plus(order.quantity)
        : sum
    },
    ZERO_IN_BASE
  )

  const hasNoAvailableBalance = new BigNumberInBase(positionQuantity)
    .minus(reduceOnlyOrderAmount)
    .lte(0)

  return (
    !position.value ||
    hasNoAvailableBalance ||
    position.value.direction ===
      derivativeFormValues.value[DerivativesTradeFormField.Side]
  )
})

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
      :data-cy="
        dataCyTag(PerpetualMarketCyTags.AdvancedSettingsReduceOnlyCheckbox)
      "
    >
      {{ $t('trade.reduceOnly') }}
    </AppCheckbox>
  </div>
</template>
