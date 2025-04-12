<script setup lang="ts">
import { useIMask } from 'vue-imask'
import { FactoryOpts } from 'imask'
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { calculateLeverage } from '@/app/utils/formatters'
import { UI_DEFAULT_LEVERAGE } from '@/app/utils/constants'
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativesTradeFormField,
  PerpetualMarketCyTags
} from '@/types'

const appStore = useAppStore()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const maxLeverageAvailable = computed(() =>
  calculateLeverage(market.value.initialMarginRatio).toFixed()
)

const futuresLeveragePreference = computed(() => {
  const leveragePreference =
    appStore.userState.preferences.futuresLeverage || '1'

  const futuresLeverage = Math.round(parseFloat(leveragePreference) * 100) / 100

  return futuresLeverage > Number(maxLeverageAvailable.value)
    ? maxLeverageAvailable.value
    : leveragePreference
})

const { el, typed } = useIMask(
  computed(
    () =>
      ({
        mask: 'num',
        lazy: false,
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: ',',
            radix: '.',
            mapToRadix: ['.', ','],
            scale: 2,
            lazy: false,
            min: 0.1,
            max: Number(maxLeverageAvailable.value),
            autofix: true
          }
        }
      }) as FactoryOpts
  )
)

const leverageModel = computed({
  get: () => leverage.value || '0',
  set: (value) => {
    leverage.value = value
    typed.value = value
  }
})

watch(
  () => typed.value,
  (value) => {
    leverage.value = value
    appStore.setFuturesLeverage(value)
  }
)

const maxLeverageAllowed = computed(() => {
  return new BigNumberInBase(maxLeverageAvailable.value)
})

const { value: leverage, errorMessage } = useStringField({
  name: DerivativesTradeFormField.Leverage,
  initialValue: futuresLeveragePreference.value || UI_DEFAULT_LEVERAGE,
  dynamicRule: computed(() => `maxLeverage:${maxLeverageAllowed.value}`)
})

function onBlur() {
  typed.value = leverage.value || UI_DEFAULT_LEVERAGE

  onMouseUp()
}

function onEnter(ev: Event) {
  const target = ev.target as HTMLInputElement
  target.blur()
}

function onMouseUp() {
  if (maxLeverageAllowed.value.lt(leverage.value)) {
    leverageModel.value = maxLeverageAllowed.value.toFixed()
  }

  if (Number(leverage.value) < 0) {
    leverageModel.value = '0.01'
  }
}

const leverageNumber = computed({
  get: () => Number(leverageModel.value),
  set: (value) => (leverageModel.value = value.toString())
})

onMounted(() => {
  leverageModel.value = '1'
})
</script>

<template>
  <div class="mt-4">
    <div class="flex gap-2 text-xs">
      <p class="font-semibold text-white">
        {{ $t('trade.leverage') }}
      </p>
      <p class="text-coolGray-450">Up to {{ maxLeverageAvailable }}x</p>
    </div>

    <div class="flex items-center my-1">
      <div class="flex-1 pr-4 relative">
        <PartialsTradeFuturesFormStandardLeverageSlider
          v-model="leverageNumber"
          :step="0.01"
          :min-leverage="0.01"
          :max-leverage="Number(maxLeverageAvailable)"
          @mouseup="onMouseUp"
        />
      </div>

      <label
        class="bg-brand-875 border border-[#181E31] rounded flex px-3 basis-24 min-w-0 h-10 focus-within:focus-ring transition-all duration-300"
      >
        <input
          ref="el"
          :value="leverage"
          type="text"
          class="min-w-0 bg-transparent text-coolGray-100 focus:outline-none text-sm text-right"
          :data-cy="dataCyTag(PerpetualMarketCyTags.LeverageInputField)"
          @keydown.enter="onEnter"
          @blur="onBlur"
        />
        <span class="flex items-center pl-2 select-none text-white">
          &times;
        </span>
      </label>
    </div>

    <p
      class="error-message mb-4"
      :data-cy="dataCyTag(PerpetualMarketCyTags.LeverageError)"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
