<script lang="ts" setup>
import { useIMask } from 'vue-imask'
import { dataCyTag } from '@shared/utils'
import { calculateLeverage } from '@/app/utils/formatters'
import { UI_DEFAULT_LEVERAGE } from '@/app/utils/constants'
import {
  MarketKey,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { FactoryOpts } from 'imask'
import type { BigNumberInBase } from '@injectivelabs/utils'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const props = withDefaults(
  defineProps<{
    leverage: string
    errorMessage?: string
    worstPrice: BigNumberInBase
    futuresLeveragePreference: string
    maxLeverageAllowed: BigNumberInBase
  }>(),
  { errorMessage: '' }
)

const emit = defineEmits<{
  'update:leverage': [value: string]
}>()

const minLeverage = 1

const maxLeverageAvailable = computed(() =>
  calculateLeverage(market.value.initialMarginRatio).toFixed()
)

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
            min: minLeverage,
            max: Number(maxLeverageAvailable.value),
            autofix: true
          }
        }
      }) as FactoryOpts
  )
)

const leverageModel = computed({
  get: () => props.leverage || '0',
  set: (value) => {
    emit('update:leverage', value)
    typed.value = value
  }
})

watch(
  () => typed.value,
  (value) => {
    emit('update:leverage', value)
  }
)

function onBlur() {
  typed.value = props.leverage || UI_DEFAULT_LEVERAGE
  onMouseUp()
}

function onEnter(event: Event) {
  const target = event.target as HTMLInputElement
  target.blur()
}

function onMouseUp() {
  if (props.maxLeverageAllowed.lt(props.leverage)) {
    leverageModel.value = props.maxLeverageAllowed.toFixed()
  }

  if (Number(props.leverage) < 0) {
    leverageModel.value = `${minLeverage}`
  }
}

watch(
  () => derivativeFormValues.value[DerivativesTradeFormField.ReduceOnly],
  () => {
    leverageModel.value = props.futuresLeveragePreference || UI_DEFAULT_LEVERAGE
  }
)

const leverageNumber = computed({
  get: () => Number(leverageModel.value),
  set: (value) => (leverageModel.value = value.toString())
})
</script>

<template>
  <div v-if="!derivativeFormValues[DerivativesTradeFormField.ReduceOnly]">
    <div class="flex items-end my-1">
      <div class="flex flex-col flex-1 gap-[14px] pr-4 mb-2">
        <p class="font-semibold text-white text-xs">
          {{ $t('trade.leverage') }}
        </p>

        <PartialsTradeFuturesFormStandardLeverageSlider
          v-model="leverageNumber"
          :step="0.01"
          :min-leverage="minLeverage"
          :max-leverage="Number(maxLeverageAvailable)"
          @mouseup="onMouseUp"
        />
      </div>

      <div class="flex flex-col items-center gap-2 w-[88px]">
        <p class="text-coolGray-375 text-xs">
          {{
            $t('trade.leverageModal.upTo', {
              leverageAmount: maxLeverageAvailable
            })
          }}
        </p>

        <label
          class="flex bg-brand-925 border border-[#42474E] rounded px-3 h-10 focus-within:focus-ring transition-all duration-300"
        >
          <input
            ref="el"
            type="text"
            :value="leverage"
            class="w-full bg-transparent text-coolGray-100 focus:outline-none text-sm text-right"
            :data-cy="dataCyTag(PerpetualMarketCyTags.LeverageInputField)"
            @blur="onBlur"
            @keydown.enter="onEnter"
          />
          <span class="flex items-center pl-1 select-none text-white">
            &times;
          </span>
        </label>
      </div>
    </div>

    <p
      v-if="errorMessage"
      class="error-message mb-4"
      :data-cy="dataCyTag(PerpetualMarketCyTags.LeverageError)"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
