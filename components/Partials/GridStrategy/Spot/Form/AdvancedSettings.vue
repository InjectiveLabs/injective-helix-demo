<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { ExitType } from '@injectivelabs/sdk-ts'
import { SpotGridTradingField } from '@/types'

const gridStrategyStore = useGridStrategyStore()

const isAdvancedOpen = ref(false)
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

const { value: exitTypeValue } = useStringField({
  name: SpotGridTradingField.ExitType,
  initialValue: ExitType.Quote,
  rule: ''
})

const { value: settleInValue } = useBooleanField({
  name: SpotGridTradingField.SettleIn,
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
  isAdvancedOpen.value = !isAdvancedOpen.value
}

const settleInToken = computed(() =>
  exitTypeValue.value === ExitType.Base
    ? market.value.baseToken
    : market.value.quoteToken
)

const settleOptions = computed(() => [
  {
    value: ExitType.Base,
    token: market.value.baseToken
  },
  {
    value: ExitType.Quote,
    token: market.value.quoteToken
  }
])

function setExitType(value: ExitType) {
  exitTypeValue.value = value
}

function resetTpSlFields() {
  SellBaseOnStopLossValue.value = false
  BuyBaseOnTakeProfitValue.value = false
  takeProfitValue.value = ''
  stopLossValue.value = ''
}
</script>
<template>
  <div
    class="flex justify-between items-center select-none"
    @click="toggleAdvancedSettings"
  >
    <p class="font-semibold text-sm">{{ $t('sgt.advancedSettings') }}</p>
    <div
      class="transition-all duration-300"
      :class="{ 'rotate-180': isAdvancedOpen }"
    >
      <BaseIcon name="chevron-down" is-md />
    </div>
  </div>

  <div v-if="isAdvancedOpen">
    <div class="mb-6 space-y-2">
      <div class="flex justify-between items-center">
        <AppCheckbox v-model="settleInValue">
          {{ $t('sgt.advanced.settleIn') }}
        </AppCheckbox>

        <BaseDropdown>
          <template #default="{ isOpen }">
            <button
              class="bg-gray-700 uppercase p-2 flex items-center space-x-2 rounded-md font-semibold tracking-wider text-xs"
            >
              <CommonTokenIcon v-bind="{ token: settleInToken }" is-sm />
              <p>{{ settleInToken.symbol }}</p>

              <BaseIcon
                name="chevron-down"
                is-md
                :class="{ 'rotate-180': isOpen }"
              />
            </button>
          </template>

          <template #content="{ close }">
            <div class="bg-gray-800" @click="close">
              <div
                v-for="{ value, token } in settleOptions"
                :key="value"
                class="flex space-x-2 items-center text-white p-2 pr-4 text-xs font-semibold hover:bg-gray-700 cursor-pointer tracking-wider"
                @click="setExitType(value)"
              >
                <CommonTokenIcon v-bind="{ token }" is-sm />
                <p class="uppercase">{{ token.symbol }}</p>
              </div>
            </div>
          </template>
        </BaseDropdown>
      </div>

      <div>
        <AppCheckbox v-model="isTpSlOpen" @update:modelValue="resetTpSlFields">
          {{ $t('sgt.advanced.tpSl') }}
        </AppCheckbox>
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
            $t('sgt.advanced.buyOnStop', {
              symbol: market.baseToken.symbol
            })
          }}
        </AppCheckbox>
      </div>
    </div>
  </div>
</template>
