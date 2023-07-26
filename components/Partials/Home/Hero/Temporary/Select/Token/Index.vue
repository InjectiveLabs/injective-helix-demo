<script lang="ts" setup>
import { PropType } from 'vue'
import {
  BalanceWithToken,
  BalanceWithTokenAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { SwapForm, SwapFormField } from '@/types'
import { ONE_IN_BASE } from '@/app/utils/constants'

const spotStore = useSpotStore()
const formValues = useFormValues<SwapForm>()

const props = defineProps({
  hideMax: Boolean,
  disabled: Boolean,
  required: Boolean,
  showUsd: Boolean,
  shouldCheckBalance: Boolean,
  isUserInteraction: Boolean,

  denom: {
    type: String,
    default: ''
  },

  debounce: {
    type: Number,
    default: 0
  },

  maxDecimals: {
    type: Number,
    default: 6
  },

  additionalRules: {
    type: Object,
    default: undefined
  },

  amountFieldName: {
    type: String as PropType<SwapFormField>,
    default: SwapFormField.InputAmount
  },

  options: {
    type: Array as PropType<BalanceWithToken[] | BalanceWithTokenAndPrice[]>,
    default: () => []
  }
})

const emit = defineEmits<{
  'update:denom': [state: string]
  'update:max': [{ amount: string }]
  'update:amount': [{ amount: string }]
  'update:isUserInteraction': [state: boolean]
}>()

const currentDenomIndex = ref(0)
const animateToDenomSelector = ref(0)
const animateFromAmount = ref(0)
const isInitialLoad = ref(true)

const alternatingDenoms = computed(() => {
  const injDenom = spotStore.markets.find(
    ({ baseToken }) => baseToken.symbol.toLowerCase() === 'inj'
  )?.baseToken.denom
  const atomDenom = spotStore.markets.find(
    ({ baseToken }) => baseToken.symbol.toLowerCase() === 'atom'
  )?.baseToken.denom

  const wethDenom = spotStore.markets.find(
    ({ baseToken }) => baseToken.symbol.toLowerCase() === 'weth'
  )?.baseToken.denom

  return [injDenom, atomDenom, wethDenom]
})

const currentDenom = computed(
  () => alternatingDenoms.value[currentDenomIndex.value]
)

const selectedToken = computed(() => {
  return props.options.find(({ denom }) => denom === props.denom)
})

const inputPlaceholder = computed(() =>
  ONE_IN_BASE.shiftedBy(-props.maxDecimals).toFixed()
)

const {
  value: amount,
  errors: amountErrors,
  setValue: setAmountValue
} = useStringField({
  name: props.amountFieldName,
  initialValue: '',
  rule: ''
})

const denomValue = computed({
  get: (): string => props.denom || '',
  set: (denom?: string) => {
    if (denom) {
      emit('update:isUserInteraction', true)
      emit('update:denom', denom)
    }
  }
})

function handleAmountUpdate(amount: string) {
  setAmountValue(amount)

  emit('update:amount', {
    amount
  })
}

function updateIsUserInteraction() {
  emit('update:isUserInteraction', true)
}

const updateAmountDebounce = useDebounceFn((value) => {
  /**
   *Use debounce since AppNumericInput emits two update events
   *And we only need the last one
   **/
  handleAmountUpdate(value)
}, props.debounce)

watch(
  [selectedToken, () => formValues.value[SwapFormField.OutputDenom]],
  () => {
    if (props.isUserInteraction || isInitialLoad.value) {
      return
    }

    if (props.amountFieldName === SwapFormField.InputAmount) {
      animateFromAmount.value++

      return
    }

    animateToDenomSelector.value++
  }
)

const { pause } = useIntervalFn(() => {
  isInitialLoad.value = false

  if (
    props.isUserInteraction ||
    props.amountFieldName !== SwapFormField.OutputAmount
  ) {
    pause()

    return
  }

  currentDenomIndex.value =
    (currentDenomIndex.value + 1) % alternatingDenoms.value.length

  emit('update:isUserInteraction', false)
  emit('update:denom', currentDenom.value || '')
}, 3000)
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div class="bg-gray-200 rounded-xl py-4">
    <div
      class="text-sm font-semibold text-gray-500 flex items-center justify-between px-4"
    >
      <slot />
    </div>

    <BaseDropdown
      id="temporaryDropdown"
      class="w-full mb-2"
      :disabled="disabled || options.length <= 1"
      :distance="amountErrors.length > 0 ? 44 : 24"
      :flip="false"
      :auto-size="true"
      placement="bottom"
      auto-boundary-max-size
      popper-class="tempDropdown"
    >
      <div class="px-4">
        <div class="flex justify-between">
          <Transition name="fade-down" mode="out-in">
            <AppInputNumeric
              :key="animateFromAmount"
              v-model="amount"
              sm
              no-padding
              transparent-bg
              input-classes="p-0 text-xl font-bold text-gray-600"
              :max-decimals="maxDecimals"
              :placeholder="inputPlaceholder"
              :disabled="disabled || !selectedToken"
              @update:model-value="updateAmountDebounce"
              @click.stop="updateIsUserInteraction"
            />
          </Transition>

          <div class="flex items-center gap-2">
            <Transition name="fade-down" mode="out-in">
              <PartialsHomeHeroTemporarySelectTokenItem
                v-if="selectedToken"
                :key="animateToDenomSelector"
                :token="selectedToken.token"
              />
            </Transition>

            <BaseIcon class="text-gray-600" name="caret-down-slim" sm />
          </div>
        </div>
      </div>

      <template #content="{ close }">
        <PartialsHomeHeroTemporarySelectTokenList
          v-model="denomValue"
          :balances="options"
          @close="close"
        />
      </template>
    </BaseDropdown>
  </div>
</template>

<style>
.tempDropdown.v-popper--theme-dropdown .v-popper__inner {
  @apply bg-gray-200 shadow-light;
}

.tempDropdown.v-popper--theme-dropdown .v-popper__inner::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.tempDropdown.v-popper--theme-dropdown
  .v-popper__inner::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

.tempDropdown.v-popper--theme-dropdown
  .v-popper__inner::-webkit-scrollbar-thumb {
  @apply bg-gray-300 border-2 border-gray-200 rounded-full;
}

.tempDropdown .input-wrapper {
  @apply bg-gray-200 text-gray-600;
}

.input.text-gray-600 {
  color: #434858; /* This value is for Tailwind's gray-600 color */
}
</style>
