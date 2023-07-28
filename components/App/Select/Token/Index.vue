<script lang="ts" setup>
import { PropType } from 'vue'
import {
  BalanceWithToken,
  BalanceWithTokenAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  TradeField,
  BridgeField,
  SwapFormField,
  SubaccountTransferField
} from '@/types'
import {
  ONE_IN_BASE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const props = defineProps({
  hideMax: Boolean,
  showUsd: Boolean,
  disabled: Boolean,
  required: Boolean,
  hideBalance: Boolean,
  shouldCheckBalance: Boolean,

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
    type: String as PropType<
      TradeField | BridgeField | SubaccountTransferField | SwapFormField
    >,
    default: TradeField.BaseAmount
  },

  options: {
    type: Array as PropType<BalanceWithToken[] | BalanceWithTokenAndPrice[]>,
    default: () => []
  }
})

const emit = defineEmits<{
  'update:denom': [state: string]
  'update:show': [state: boolean]
  'update:max': [{ amount: string }]
  'update:amount': [{ amount: string; isBaseAmount: boolean }]
}>()

const isModalActive = ref(false)

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
    const rules = []

    if (props.required) {
      rules.push('required')
    }

    if (props.required || props.shouldCheckBalance) {
      rules.push(`insufficientBalance:${maxBalanceToFixed.value}`)
    }

    return rules.join('|')
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

const estimatedTotalInUsd = computed(() => {
  const token = selectedToken.value as BalanceWithTokenAndPrice | undefined

  if (!amount.value || !selectedToken.value || !token?.usdPrice) {
    return '0.00'
  }

  const usdValue = new BigNumberInBase(amount.value || 0).multipliedBy(
    new BigNumberInBase(token.usdPrice || 0)
  )

  const SMALL_USD_PRICE = 0.9
  const DECIMALS_FOR_SMALL_USD_PRICE = 4
  const maxDecimalPlaces =
    new BigNumberInBase(token.usdPrice).lt(SMALL_USD_PRICE) &&
    usdValue.lt(1) &&
    usdValue.gt(0)
      ? DECIMALS_FOR_SMALL_USD_PRICE
      : props.maxDecimals

  const decimalPlaces = Math.max(
    UI_DEFAULT_MIN_DISPLAY_DECIMALS,
    maxDecimalPlaces
  )

  return usdValue.toFormat(decimalPlaces, BigNumberInBase.ROUND_DOWN)
})

function openTokenSelectorModal() {
  if (props.options.length <= 1) {
    return
  }

  isModalActive.value = true
}

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

const updateAmountDebounce = useDebounceFn((value) => {
  /**
   *Use debounce since AppNumericInput emits two update events
   *And we only need the last one
   **/
  handleAmountUpdate(value)
}, props.debounce)
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
      'border-red-500 border': amountErrors.length > 0 && required
    }"
  >
    <div
      class="text-sm font-semibold text-gray-500 flex items-center justify-between px-4 mb-2"
    >
      <slot />

      <div v-if="selectedToken" class="text-right flex items-center gap-2">
        <span
          v-if="valueToBigNumber.gt(0) && !hideMax"
          class="cursor-pointer text-blue-500 hover:text-opacity-80 bg-blue-550 bg-opacity-20 px-1 py-[1.5px] rounded uppercase text-[10px]"
          @click="handleMax"
        >
          {{ $t('trade.max') }}
        </span>
        <p v-if="!hideBalance" class="text-xs text-blue-500">
          <span>
            {{ $t('trade.balance', { balance: maxBalanceToString }) }}
          </span>
        </p>
      </div>
    </div>

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
          @update:model-value="updateAmountDebounce"
          @click.stop
        />

        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-2 p-1.5"
            :class="{
              'hover:bg-gray-150 cursor-pointer rounded-xl  transition-all duration-300 ease-in-out':
                options.length > 1
            }"
            @click="openTokenSelectorModal"
          >
            <AppSelectTokenItem
              v-if="selectedToken"
              :class="{ 'cursor-default': disabled || options.length === 1 }"
              v-bind="{
                token: selectedToken.token
              }"
            />

            <div v-else class="whitespace-nowrap">
              {{ $t('trade.swap.tokenSelector.selectToken') }}
            </div>

            <BaseIcon
              v-if="options.length > 1 || !selectedToken"
              name="caret-down-slim"
              sm
            />
          </div>

          <ModalsTokenSelector
            v-bind="{
              balances: options,
              isModalActive
            }"
            v-model="denomValue"
            v-model:isModalActive="isModalActive"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between gap-2 px-4">
      <slot name="error" v-bind="{ amountErrors }">
        <div
          class="flex flex-wrap items-center gap-1 text-sm whitespace-nowrap"
        >
          <span v-if="amountErrors.length > 0" class="text-red-500 capitalize">
            {{ amountErrors[0] }}
          </span>
        </div>
      </slot>

      <p
        v-if="showUsd && selectedToken"
        class="text-right text-sm text-gray-500 truncate"
      >
        <slot name="usdPrice" v-bind="{ estimatedTotalInUsd }">
          <span v-if="Number(amount) > 0">${{ estimatedTotalInUsd }} </span>
          <span v-else>$0.00</span>
        </slot>
      </p>
    </div>
  </div>
</template>
