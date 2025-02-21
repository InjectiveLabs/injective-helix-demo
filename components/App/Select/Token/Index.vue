<script lang="ts" setup>
import {
  NuxtUiIcons,
  SharedBalanceWithToken,
  SharedBalanceWithTokenAndPrice
} from '@shared/types'
import { dataCyTag } from '@shared/utils'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  ONE_IN_BASE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  SwapCyTags,
  TradeField,
  SwapFormField,
  BankTransferField,
  SubaccountTransferField
} from '@/types'

const props = withDefaults(
  defineProps<{
    denom?: string
    debounce?: number
    isDisabled?: boolean
    isRequired?: boolean
    maxDecimals?: number
    isMaxHidden?: boolean
    isUsdVisible?: boolean
    tensMultiplier?: number
    additionalRules?: object
    isBalanceHidden?: boolean
    amountFieldName?:
      | TradeField
      | SwapFormField
      | BankTransferField
      | SubaccountTransferField
    shouldCheckBalance?: boolean
    isTokenSelectorDisabled?: boolean
    options?: (SharedBalanceWithToken | SharedBalanceWithTokenAndPrice)[]
  }>(),
  {
    denom: '',
    debounce: 0,
    maxDecimals: 6,
    options: () => [],
    tensMultiplier: undefined,
    additionalRules: undefined,
    amountFieldName: TradeField.BaseAmount
  }
)

const emit = defineEmits<{
  'on:update': []
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

const tokenOptions = computed(() =>
  props.options.map(({ denom, token }) => ({
    label: token.symbol,
    name: token.name,
    value: denom,
    avatar: {
      src: token.logo
    }
  }))
)

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
      class="text-sm font-semibold text-coolGray-500 flex items-center justify-between px-4 mb-2"
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
            class="cursor-pointer text-blue-500 hover:text-opacity-80 bg-blue-500 bg-opacity-20 px-1 py-[1.5px] rounded uppercase text-[10px]"
            @click="changeMax"
          >
            {{ $t('trade.max') }}
          </span>
          <p v-if="!isBalanceHidden" class="text-xs text-blue-500">
            <span :data-cy="dataCyTag(SwapCyTags.BalanceString)">
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
          <slot name="token-item">
            <div>
              <USelectMenu
                v-model="denomValue"
                searchable
                :ui-menu="{ width: 'w-72', input: 'dark:bg-brand-900' }"
                :options="tokenOptions"
                :search-attributes="['label', 'name', 'symbol', 'value']"
                value-attribute="value"
              >
                <template #default="{ open }">
                  <div class="flex items-center gap-2">
                    <UAvatar :src="selectedToken?.token.logo" size="xs" />
                    <span class="font-semibold">
                      {{ selectedToken?.token.symbol }}
                    </span>
                    <UIcon
                      :name="NuxtUiIcons.ChevronDown"
                      :class="{ 'rotate-180': open }"
                      class="transition-all"
                    />
                  </div>
                </template>

                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <UAvatar :src="option.avatar.src" size="xs" />

                    <div class="truncate">
                      <span>{{ option.label }} </span>
                      <span class="text-xs text-coolGray-500">
                        - {{ option.name }}
                      </span>
                    </div>
                  </div>
                </template>
              </USelectMenu>
            </div>
          </slot>
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
        class="text-right text-sm text-coolGray-500 truncate"
      >
        <slot name="usdPrice" v-bind="{ estimatedTotalInUsd }">
          <span v-if="Number(amount) > 0">${{ estimatedTotalInUsd }} </span>
          <span v-else :data-cy="dataCyTag(SwapCyTags.TokenEstUsdPrice)">
            $0.00
          </span>
        </slot>
      </p>
    </div>
  </div>
</template>
