<script lang="ts" setup>
import { PropType } from 'vue'
import { AccountBalance, BridgeField, TradeField } from '@/types'
import { ONE_IN_BASE } from '@/app/utils/constants'
import { usdcTokenDenom } from '@/app/data/token'

const props = defineProps({
  disabled: Boolean,
  required: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  amountFieldName: {
    type: String as PropType<TradeField | BridgeField>,
    default: TradeField.BaseAmount
  },

  maxDecimals: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits<{
  (
    e: 'update:amount',
    { amount, isBaseAmount }: { amount: string; isBaseAmount: boolean }
  ): void
}>()

const { valueToFixed: maxBalanceToFixed } = useBigNumberFormatter(
  computed(() => props.balance.availableMargin),
  {
    decimalPlaces: props.maxDecimals
  }
)

const {
  errors: amountErrors,
  setValue: setAmountValue,
  value: amount
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

const inputPlaceholder = computed(() =>
  ONE_IN_BASE.shiftedBy(-props.maxDecimals).toFixed()
)

onMounted(() => {
  if (
    props.amountFieldName === TradeField.BaseAmount &&
    [usdcTokenDenom.USDC].includes(props.balance.denom)
  ) {
    setAmountValue(maxBalanceToFixed.value)

    emit('update:amount', {
      isBaseAmount: props.amountFieldName === TradeField.BaseAmount,
      amount: maxBalanceToFixed.value
    })
  }
})

function handleAmountUpdate(amount: string) {
  setAmountValue(amount)

  emit('update:amount', {
    amount,
    isBaseAmount: props.amountFieldName === TradeField.BaseAmount
  })
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div
    class="flex-col bg-gray-1000 rounded-xl py-4 max-h-24"
    :class="{
      'border-red-500 border': amountErrors.length > 0
    }"
  >
    <div
      class="text-sm font-semibold text-gray-500 flex items-center justify-between px-4 mb-2"
    >
      <div class="px-4">
        <div class="flex justify-between">
          <AppInputNumeric
            v-model="amount"
            sm
            no-padding
            transparent-bg
            input-classes="p-0 text-xl font-bold"
            :placeholder="inputPlaceholder"
            :disabled="disabled"
            :max-decimals="maxDecimals"
            @update:model-value="handleAmountUpdate"
            @click.stop
          />

          <div class="flex flex-col gap-2 basis-full">
            <div class="flex justify-end text-white">
              <AppSelectTokenItem v-if="balance" :token="balance.token" xl />
            </div>

            <div
              class="text-right flex items-center justify-end gap-2 text-xs font-normal text-blue-500"
            >
              <span class="cursor-pointer hover:text-opacity-80">
                {{ $t('account.available') }}:
              </span>
              <p>
                {{ maxBalanceToFixed }}
                {{ props.balance.token.symbol }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between gap-2 px-4">
      <div class="flex flex-wrap items-center gap-1 text-xs whitespace-nowrap">
        <span v-if="amountErrors.length > 0" class="text-red-500 capitalize">
          {{ amountErrors[0] }}
        </span>
      </div>
    </div>
  </div>
</template>
