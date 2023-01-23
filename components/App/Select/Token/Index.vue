<script lang="ts" setup>
import { PropType } from 'vue'
import { BalanceWithToken, BridgeField, TradeField } from '@/types'
import { ONE_IN_BASE } from '@/app/utils/constants'

const props = defineProps({
  disabled: Boolean,
  hideMax: Boolean,
  required: Boolean,

  additionalRules: {
    type: Object,
    default: undefined
  },

  amountFieldName: {
    type: String as PropType<TradeField | BridgeField>,
    default: TradeField.BaseAmount
  },

  denom: {
    type: String,
    default: ''
  },

  maxDecimals: {
    type: Number,
    default: 6
  },

  options: {
    type: Array as PropType<BalanceWithToken[]>,
    default: () => []
  }
})

const emit = defineEmits<{
  (e: 'update:denom', state: string): void
  (e: 'update:modelValue', state: string): void
  (e: 'update:max', state: string): void
}>()

const selectedToken = computed(() =>
  props.options.find(({ denom }) => denom === props.denom)
)

const { valueToBigNumber, valueToFixed: maxBalanceToFixed } =
  useBigNumberFormatter(
    computed(() =>
      selectedToken.value ? selectedToken.value.balanceInToken : '0'
    ),
    {
      decimalPlaces: props.maxDecimals
    }
  )

const {
  value: amount,
  errors: amountErrors,
  setValue: setAmountValue
} = useStringField({
  name: props.amountFieldName,
  rule: '',
  dynamicRule: computed(() => {
    if (!props.required) {
      return ''
    }
    return `insufficientBalance:${maxBalanceToFixed.value}|required`
  })
})

const denomValue = computed({
  get: (): string | undefined => props.denom || '',
  set: (denom?: string) => {
    if (denom) {
      emit('update:denom', denom)
    }
  }
})

const inputPlaceholder = computed(() =>
  ONE_IN_BASE.shiftedBy(-props.maxDecimals).toFixed()
)

function handleAmountUpdate(amount: string) {
  emit('update:modelValue', amount)
  setAmountValue(amount)
}

function handleMax() {
  emit('update:max', maxBalanceToFixed.value)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div
    class="bg-gray-1000 rounded-xl py-4"
    :class="{
      'border-red-500 border': amountErrors.length > 0
    }"
  >
    <div
      class="text-sm font-semibold text-gray-500 flex items-center justify-between px-4 mb-2"
    >
      <slot />

      <div v-if="selectedToken" class="text-right flex items-center gap-2">
        <span
          v-if="valueToBigNumber.gt(0) && !hideMax"
          class="cursor-pointer text-blue-500 hover:text-opacity-80"
          @click="handleMax"
        >
          {{ $t('trade.max') }}:
        </span>
        <p>{{ maxBalanceToFixed }} {{ selectedToken.token.symbol }}</p>
      </div>
    </div>

    <BaseDropdown
      class="w-full"
      :disabled="disabled"
      :distance="amountErrors.length > 0 ? 44 : 24"
      auto-size="true"
      auto-boundary-max-size
      popper-class="dropdown"
    >
      <div class="px-4">
        <div class="flex justify-between">
          <AppNumericInput
            v-model="amount"
            sm
            no-padding
            transparent-bg
            input-classes="p-0 text-xl font-bold"
            :placeholder="inputPlaceholder"
            :disabled="disabled || !selectedToken"
            :max-decimals="maxDecimals"
            @update:model-value="handleAmountUpdate"
            @click.stop
          />

          <div class="flex items-center gap-2">
            <AppSelectTokenItem
              v-if="selectedToken"
              :token="selectedToken.token"
            />
            <BaseIcon name="caret-down-slim" sm />
          </div>
        </div>
      </div>

      <template #content="{ close }">
        <AppSelectTokenList
          v-model="denomValue"
          :balances="options"
          :close="close"
        />
      </template>
    </BaseDropdown>

    <div class="flex items-center justify-between gap-2 px-4">
      <div class="flex flex-wrap items-center gap-1 text-sm whitespace-nowrap">
        <span v-if="amountErrors.length > 0" class="text-red-500 capitalize">
          {{ amountErrors[0] }}
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.dropdown.v-popper--theme-dropdown .v-popper__inner {
  @apply bg-gray-800 border-blue-300 pb-4 shadow-sm;
}
</style>
