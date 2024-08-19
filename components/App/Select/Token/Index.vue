<script lang="ts" setup>
import {
  SharedBalanceWithToken,
  SharedBalanceWithTokenAndPrice
} from '@shared/types'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  ONE_IN_BASE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  Modal,
  TradeField,
  SwapFormField,
  SubaccountTransferField
} from '@/types'

const props = defineProps({
  isMaxHidden: Boolean,
  isUsdVisible: Boolean,
  isDisabled: Boolean,
  isRequired: Boolean,
  isBalanceHidden: Boolean,
  shouldCheckBalance: Boolean,
  isTokenSelectorDisabled: Boolean,

  denom: {
    type: String,
    default: ''
  },

  modal: {
    required: false,
    default: Modal.TokenSelector,
    type: String as PropType<Modal>
  },

  debounce: {
    type: Number,
    default: 0
  },

  maxDecimals: {
    type: Number,
    default: 6
  },

  tensMultiplier: {
    type: Number,
    required: false,
    default: undefined
  },

  additionalRules: {
    type: Object,
    default: undefined
  },

  amountFieldName: {
    type: String as PropType<
      TradeField | SubaccountTransferField | SwapFormField
    >,
    default: TradeField.BaseAmount
  },

  options: {
    type: Array as PropType<
      SharedBalanceWithToken[] | SharedBalanceWithTokenAndPrice[]
    >,
    default: () => []
  }
})

const modalStore = useModalStore()

const emit = defineEmits<{
  'on:update': []
  'update:modal': []
  'update:max': [{ amount: string }]
  'update:denom': [state: string]
  'update:amount': [{ amount: string; isBaseAmount: boolean }]
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

const inputPlaceholder = computed(() => {
  if (!props.tensMultiplier) {
    return ONE_IN_BASE.shiftedBy(-props.maxDecimals).toFixed()
  }

  return ONE_IN_BASE.shiftedBy(props.tensMultiplier).toFixed()
})

const {
  valueToBigNumber,
  valueToFixed: maxBalanceToFixed,
  valueToString: maxBalanceToString
} = useSharedBigNumberFormatter(selectedTokenBalance, {
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

    if (props.isRequired) {
      rules.push('required')
    }

    if (props.isRequired || props.shouldCheckBalance) {
      rules.push(`insufficientBalance:${maxBalanceToFixed.value}`)
    }

    return rules.join('|')
  })
})

const denomValue = computed({
  get: (): string => props.denom || '',
  set: (denom?: string) => {
    if (denom && denom !== props.denom) {
      emit('update:denom', denom)
    }
  }
})

const estimatedTotalInUsd = computed(() => {
  const token = selectedToken.value as
    | SharedBalanceWithTokenAndPrice
    | undefined

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

  if (props.isTokenSelectorDisabled) {
    return
  }

  modalStore.openModal(props.modal)
  emit('update:modal')
}

function changeAmount(amount: string) {
  setAmountValue(amount)

  emit('update:amount', {
    amount,
    isBaseAmount: props.amountFieldName === TradeField.BaseAmount
  })
}

function changeMax() {
  emit('update:max', { amount: maxBalanceToFixed.value })
}

function onAmountChange(value: string) {
  emit('on:update')
  onAmountChangeDebounced(value)
}

const onAmountChangeDebounced = useDebounceFn((value) => {
  /**
   * Use debounce since AppNumericInput emits two update events
   * And we only need the last one
   **/
  if (!props.tensMultiplier) {
    return changeAmount(value)
  }

  const allowableValue = formatAmountToAllowableAmount(
    value,
    props.tensMultiplier
  )

  changeAmount(allowableValue)
}, props.debounce)
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div
    class="bg-brand-875 border border-brand-700 rounded-xl py-4"
    :class="{
      'border-red-500 border': amountErrors.length > 0 && isRequired
    }"
  >
    <div
      class="text-sm font-semibold text-gray-500 flex items-center justify-between px-4 mb-2"
    >
      <slot />

      <slot
        name="balance"
        v-bind="{
          changeMax,
          selectedToken,
          valueToBigNumber,
          maxBalanceToString
        }"
      >
        <div v-if="selectedToken" class="text-right flex items-center gap-2">
          <span
            v-if="valueToBigNumber.gt(0) && !isMaxHidden"
            class="cursor-pointer text-blue-500 hover:text-opacity-80 bg-blue-550 bg-opacity-20 px-1 py-[1.5px] rounded uppercase text-[10px]"
            @click="changeMax"
          >
            {{ $t('trade.max') }}
          </span>
          <p v-if="!isBalanceHidden" class="text-xs text-blue-500">
            <span :data-cy="dataCyTag('balance-string')">
              {{ $t('trade.balance', { balance: maxBalanceToString }) }}
            </span>
          </p>
        </div>
      </slot>
    </div>

    <div class="px-4">
      <div class="flex justify-between">
        <AppInputNumeric
          v-model="amount"
          is-sm
          is-no-padding
          is-transparent-bg
          input-classes="p-0 text-xl font-bold"
          :max-decimals="maxDecimals"
          :tens-multiplier="tensMultiplier"
          :placeholder="inputPlaceholder"
          :is-disabled="isDisabled || !selectedToken"
          @update:model-value="onAmountChange"
          @click.stop
        />

        <div class="flex items-center gap-2">
          <slot
            name="token-item"
            v-bind="{ openTokenSelectorModal, selectedToken }"
          >
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
                :class="{
                  'cursor-default': isDisabled || options.length === 1
                }"
                v-bind="{
                  token: selectedToken.token
                }"
              />

              <div v-else-if="options.length > 0" class="whitespace-nowrap">
                {{ $t('trade.swap.tokenSelector.selectToken') }}
              </div>

              <SharedIcon
                v-if="options.length > 1 || !selectedToken"
                name="caret-down-slim"
                is-sm
              />
            </div>
          </slot>

          <ModalsTokenSelector
            v-model="denomValue"
            v-bind="{
              modal,
              ...$attrs,
              balances: options
            }"
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
        v-if="isUsdVisible && selectedToken"
        class="text-right text-sm text-gray-500 truncate"
      >
        <slot name="usdPrice" v-bind="{ estimatedTotalInUsd }">
          <span v-if="Number(amount) > 0">${{ estimatedTotalInUsd }} </span>
          <span v-else :data-cy="dataCyTag('token-estimated-usd-price')">
            $0.00
          </span>
        </slot>
      </p>
    </div>
  </div>
</template>
