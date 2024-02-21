<script lang="ts" setup>
import { Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_SLIPPAGE, MAX_SLIPPAGE } from '@/app/utils/constants'
import { TradeField, TradeForm } from '@/types'
import { tradeErrorMessages } from '@/app/client/utils/validation/trade'

enum SlippageDisplayOptions {
  NonSelectableDefault = 'Zero',
  SlippageInput = 'Selected',
  Selectable = 'Selectable'
}

const { t } = useLang()

const formValues = useFormValues() as Ref<TradeForm>
const setFormValues = useSetFormValues()

const props = defineProps({
  isSpot: Boolean,
  isBaseAmount: Boolean,
  isConditionalOrder: Boolean,
  reduceOnlyDisabled: Boolean
})

const drawerIsOpen = ref(true)
const slippageSelection = ref(SlippageDisplayOptions.Selectable)
const slippageIsToggable = ref(true)

const {
  tradingTypeStopMarket,
  tradingTypeLimit: derivativeTradingTypeLimit,
  tradingTypeMarket: derivativeTradingTypeMarket
} = useDerivativeFormFormatter(formValues)

const {
  tradingTypeLimit: spotTradingTypeLimit,
  tradingTypeMarket: spotTradingTypeMarket
} = useSpotFormFormatter(formValues)

const tradingTypeLimit = props.isSpot
  ? spotTradingTypeLimit
  : derivativeTradingTypeLimit

const tradingTypeMarket = props.isSpot
  ? spotTradingTypeMarket
  : derivativeTradingTypeMarket

const { value: reduceOnly, setValue: setReduceOnlyValue } = useField<boolean>(
  TradeField.ReduceOnly
)

const { value: postOnly, setValue: setPostOnlyValue } = useField<boolean>(
  TradeField.PostOnly
)

const {
  value: slippageTolerance,
  errors: slippageToleranceError,
  setValue: setSlippageToleranceValue
} = useStringField({
  name: TradeField.SlippageTolerance,
  initialValue: '0.5',
  rule: 'slippage'
})

const postOnlyValue = computed({
  get: (): boolean => postOnly.value,
  set: (postOnly: boolean) => {
    setPostOnlyValue(postOnly)
  }
})

const reduceOnlyValue = computed({
  get: (): boolean => reduceOnly.value,
  set: (reduceOnly: boolean) => {
    const LEVERAGE_FOR_REDUCE_ONLY = '1'

    setReduceOnlyValue(reduceOnly)

    setFormValues(
      {
        [TradeField.Leverage]: LEVERAGE_FOR_REDUCE_ONLY
      },
      false
    )
  }
})

const wrapperClasses = computed(() => {
  const classes = [
    'rounded',
    'border',
    'shadow-none',
    'border-transparent',
    'input-wrapper'
  ]

  if (showSlippageWarning.value) {
    classes.push('border-orange-500 bg-orange-500 bg-opacity-10')
  }

  if (showSlippageError.value) {
    classes.push('border-red-500 bg-red-500 bg-opacity-10')
  }

  return classes.join(' ')
})

const inputClasses = computed(() => {
  const classes = ['input-small', 'text-right', 'text-sm', 'px-1']

  if (showSlippageWarning.value || showSlippageError.value) {
    classes.push('input-small bg-transparent text-right text-sm px-1')
  }

  return classes.join(' ')
})

const showSlippageAsSelectableOrDefaultForMarket = computed(() =>
  [
    SlippageDisplayOptions.Selectable,
    SlippageDisplayOptions.NonSelectableDefault
  ].includes(slippageSelection.value)
)

const showSlippageInputFieldForMarket = computed(
  () =>
    slippageSelection.value === SlippageDisplayOptions.SlippageInput &&
    (tradingTypeMarket.value || tradingTypeStopMarket.value)
)

const reduceOnlyTooltip = computed(() => {
  if (!props.reduceOnlyDisabled) {
    return
  }

  return props.isConditionalOrder
    ? t('trade.reduceOnlyTooltipConditional')
    : t('trade.reduceOnlyTooltip')
})

const showSlippageWarning = computed(
  () =>
    (tradingTypeMarket.value || tradingTypeStopMarket.value) &&
    slippageToleranceError.value.some(
      (error: string) =>
        error === tradeErrorMessages.slippageTooLow() ||
        error === tradeErrorMessages.slippageTooHigh()
    )
)

const showSlippageError = computed(
  () =>
    (tradingTypeMarket.value || tradingTypeStopMarket.value) &&
    slippageToleranceError.value.includes(tradeErrorMessages.slippageExceed())
)

watch(slippageTolerance, (tolerance) => {
  if (new BigNumberInBase(tolerance).gt(0)) {
    slippageIsToggable.value = true
  }
})

function handleBlur(value: string): void {
  if (value === '') {
    value = DEFAULT_SLIPPAGE.toFormat(1)
  }

  if (Number(value) > MAX_SLIPPAGE.toNumber()) {
    value = MAX_SLIPPAGE.toFixed()
  }

  setSlippageToleranceValue(value)
  toggleSlippageToSelectable()
}

function handleSlippageCheckboxToggle() {
  if (slippageIsToggable.value) {
    setToZeroSlippage()
  } else {
    setToDefaultSlippage()
    toggleSlippageToSelectable()
  }
}

function setToZeroSlippage() {
  slippageSelection.value = SlippageDisplayOptions.NonSelectableDefault

  setSlippageToleranceValue('0')
}

function setToDefaultSlippage() {
  slippageSelection.value = SlippageDisplayOptions.NonSelectableDefault

  setSlippageToleranceValue(DEFAULT_SLIPPAGE.toFormat(1))
}

function toggleSlippageToSelectable() {
  slippageSelection.value = SlippageDisplayOptions.Selectable
}

function toggleToSlippageInput() {
  slippageSelection.value = SlippageDisplayOptions.SlippageInput

  window.requestAnimationFrame(focusOnSlippageInput)
}

function focusOnSlippageInput() {
  const slippageInput = document.getElementById(
    'focusOnInput'
  ) as HTMLInputElement

  if (slippageInput) {
    slippageInput.focus()
  }
}

function toggleDrawer() {
  drawerIsOpen.value = !drawerIsOpen.value
}
</script>

<template>
  <div class="border-t mt-6">
    <div
      class="group flex align-center my-2 cursor-pointer select-none"
      @click.stop="toggleDrawer"
    >
      <span
        class="block font-semibold text-sm text-gray-200 flex-1"
        data-cy="trading-page-advanced-settings-span"
      >
        {{ $t('trade.advanced_settings') }}
      </span>
      <div class="flex items-stretch">
        <BaseIcon
          name="caret-down"
          class="text-gray-500 group-hover:text-gray-200 rotate-180 self-center w-4 h-4"
          :class="{ 'rotate-0': !drawerIsOpen }"
        />
      </div>
    </div>
    <div v-show="drawerIsOpen" class="flex gap-1 my-auto">
      <span class="flex flex-col flex-1 my-auto gap-1">
        <AppCheckbox
          v-if="!isSpot"
          v-model="reduceOnlyValue"
          :is-disabled="reduceOnlyDisabled"
          :tooltip="reduceOnlyTooltip"
          data-cy="trading-page-reduce-only-checkbox"
        >
          <slot>
            <span class="text-sm">
              {{ $t('trade.reduce_only') }}
            </span>
          </slot>
        </AppCheckbox>
        <div
          v-if="tradingTypeMarket || tradingTypeStopMarket"
          class="flex justify-between"
        >
          <AppCheckbox
            v-model="slippageIsToggable"
            data-cy="trading-page-slippage-checkbox"
            @input="handleSlippageCheckboxToggle"
          >
            <slot>
              <span class="text-sm whitespace-nowrap overflow-ellipsis pr-2">
                {{ `${$t('trade.slippage_tolerance')} :` }}
              </span>
            </slot>
          </AppCheckbox>
          <div
            v-show="showSlippageAsSelectableOrDefaultForMarket"
            class="group flex items-center cursor-pointer gap-2"
            @click="toggleToSlippageInput()"
          >
            <div class="text-sm">{{ slippageTolerance }}%</div>
            <BaseIcon
              name="caret-down"
              class="text-gray-500 group-hover:text-gray-200 w-4 h-4"
              data-cy="trading-page-slippage-toggle-icon"
              :class="{
                invisible: !slippageIsToggable
              }"
            />
          </div>

          <div
            v-show="showSlippageInputFieldForMarket"
            class="basis-1/5 flex items-center"
          >
            <AppInputNumeric
              id="focusOnInput"
              v-model="slippageTolerance"
              is-transparent-bg
              :wrapper-classes="wrapperClasses"
              :input-classes="inputClasses"
              :is-disabled="!slippageIsToggable"
              :step="0.01"
              :max-decimals="2"
              is-sm
              data-cy="trading-page-slippage-input"
              @blur="handleBlur"
            >
              <template #addon>
                <span class="lg:hidden"> % </span>
              </template>
            </AppInputNumeric>
          </div>
        </div>
        <AppCheckbox
          v-if="tradingTypeLimit"
          v-model="postOnlyValue"
          data-cy="trading-page-post-only-checkbox"
        >
          <slot>
            <span class="text-sm">
              {{ $t('trade.post_only') }}
            </span>
          </slot>
        </AppCheckbox>
      </span>
    </div>
    <div
      v-if="showSlippageWarning || showSlippageError"
      class="flex mt-4 gap-2 text-xs font-semibold"
      :class="showSlippageWarning ? 'text-orange-500' : 'text-red-500'"
      font-semibold
      text-2xs
    >
      <BaseIcon name="exclamation-circle-fill" is-sm class="mt-0.25" />
      <span>
        {{ slippageToleranceError[0] }}
      </span>
    </div>
  </div>
</template>
