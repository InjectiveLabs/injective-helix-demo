<script lang="ts" setup>
import { PropType } from 'vue'
import { BalanceWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { BridgeField, SubaccountTransferField, TradeField } from '@/types'
import { ONE_IN_BASE } from '@/app/utils/constants'

const props = defineProps({
  hideMax: Boolean,
  disabled: Boolean,
  required: Boolean,

  denom: {
    type: String,
    default: ''
  },

  options: {
    type: Array as PropType<BalanceWithToken[]>,
    default: () => []
  },

  maxDecimals: {
    type: Number,
    default: 6
  },

  amountFieldName: {
    type: String as PropType<
      TradeField | BridgeField | SubaccountTransferField
    >,
    default: TradeField.BaseAmount
  },

  additionalRules: {
    type: Object,
    default: undefined
  }
})

const emit = defineEmits<{
  (e: 'update:denom', state: string): void
  (e: 'update:show', show: boolean): void
  (
    e: 'update:amount',
    { amount, isBaseAmount }: { amount: string; isBaseAmount: boolean }
  ): void
  (e: 'update:max', { amount }: { amount: string }): void
}>()

const selectedToken = computed(() =>
  props.options.find(({ denom }) => denom === props.denom)
)
const selectedTokenBalance = computed(() =>
  selectedToken.value
    ? new BigNumberInWei(selectedToken.value.balance).toBase(
        selectedToken.value.token.decimals
      )
    : '0'
)

const inputPlaceholder = computed(() =>
  ONE_IN_BASE.shiftedBy(-props.maxDecimals).toFixed()
)

const {
  valueToBigNumber,
  valueToFixed: maxBalanceToFixed,
  valueToString: maxBalanceToString
} = useBigNumberFormatter(selectedTokenBalance, {
  decimalPlaces: props.maxDecimals
})

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
  get: (): string => props.denom || '',
  set: (denom?: string) => {
    if (denom) {
      emit('update:denom', denom)
    }
  }
})

function handleAmountUpdate(amount: string) {
  setAmountValue(amount)

  emit('update:amount', {
    amount,
    isBaseAmount: props.amountFieldName === TradeField.BaseAmount
  })
}

function handleMax() {
  emit('update:max', { amount: maxBalanceToFixed.value })
}

function handleUpdateShow(show: boolean) {
  emit('update:show', show)
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
        <p>{{ maxBalanceToString }} {{ selectedToken.token.symbol }}</p>
      </div>
    </div>

    <BaseDropdown
      class="w-full"
      :disabled="disabled || options.length <= 1"
      :distance="amountErrors.length > 0 ? 44 : 24"
      :flip="false"
      :auto-size="true"
      placement="bottom"
      auto-boundary-max-size
      popper-class="dropdown"
      @update:show="handleUpdateShow"
    >
      <div class="px-4">
        <div class="flex justify-between">
          <AppInputNumeric
            v-model="amount"
            sm
            no-padding
            transparent-bg
            input-classes="p-0 text-xl font-bold"
            :max-decimals="maxDecimals"
            :placeholder="inputPlaceholder"
            :disabled="disabled || !selectedToken"
            @update:model-value="handleAmountUpdate"
            @click.stop
          />

          <div class="flex items-center gap-2">
            <AppSelectTokenItem
              v-if="selectedToken"
              :token="selectedToken.token"
            />
            <BaseIcon
              v-if="!disabled && options.length > 1"
              name="caret-down-slim"
              sm
            />
          </div>
        </div>
      </div>

      <template #content="{ close }">
        <AppSelectTokenList
          v-model="denomValue"
          :close="close"
          :balances="options"
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
  @apply bg-gray-800 border-blue-300 shadow-sm;
}
</style>
