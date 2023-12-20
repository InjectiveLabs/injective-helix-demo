<script lang="ts" setup>
import { SpotGridTradingField } from '@/types'

const isOpen = ref(false)

const { value: stopLossValue, errorMessage: stopLossError } = useStringField({
  name: SpotGridTradingField.StopLoss,
  rule: `lessThanSgt:@${SpotGridTradingField.LowerPrice}`
})

const { value: takeProfitValue, errorMessage: takeProfitError } =
  useStringField({
    name: SpotGridTradingField.TakeProfit,
    rule: `greaterThanSgt:@${SpotGridTradingField.UpperPrice}`
  })

const { value: sellAllBase } = useBooleanField({
  name: SpotGridTradingField.SellAllBase,
  rule: ''
})

function toggleSellAllBase() {
  sellAllBase.value = !sellAllBase.value
}

function toggleAdvancedSettings() {
  isOpen.value = !isOpen.value
}
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
    <p class="font-semibold text-sm mb-2">{{ $t('sgt.stopTrigger') }}</p>

    <div class="mb-4">
      <AppInputNumeric
        v-model="stopLossValue"
        :placeholder="$t('sgt.stopLoss')"
      />

      <p v-if="stopLossError" class="mt-2 text-red-500 text-xs font-semibold">
        {{ stopLossError }}
      </p>
    </div>

    <div class="mb-4">
      <AppInputNumeric
        v-model="takeProfitValue"
        :placeholder="$t('sgt.takeProfit')"
      />

      <p v-if="takeProfitError" class="mt-2 text-red-500 text-xs font-semibold">
        {{ takeProfitError }}
      </p>
    </div>

    <!-- REMOVE v-if WHEN WE HAVE SUPPORT FROM SC -->
    <div v-if="false" class="flex items-center select-none">
      <AppCheckbox v-model="sellAllBase" />
      <p class="text-xs" @click="toggleSellAllBase">
        {{ $t('sgt.sellAllBaseCoinsOnStop') }}
      </p>
    </div>
  </div>
</template>
