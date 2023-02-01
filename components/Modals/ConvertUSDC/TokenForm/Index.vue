<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSpotMarketWithToken, SpotOrderSide } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  AccountBalance,
  Modal,
  TradeField,
  TradeForm,
  TradeFormValue
} from '@/types'
import {
  TRADE_FORM_PRICE_ROUNDING_MODE,
  TRADE_FORM_QUANTITY_ROUNDING_MODE
} from '@/app/utils/constants'
import { usdcTokenDenom } from '@/app/data/token'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const props = defineProps({
  isBase: Boolean,
  isLoading: Boolean,

  balances: {
    type: Object as PropType<AccountBalance[]>,
    required: true
  },

  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:isBase', state: boolean): void
  (e: 'update:formValue', state: TradeFormValue): void
}>()

const animationCount = ref(0)

const { takerFeeRate } = useTradeFee(computed(() => props.market))

const baseBalance = computed(() =>
  props.balances.find(
    (balance) => balance.token.denom === props.market.baseToken.denom
  )
)

const quoteBalance = computed(() =>
  props.balances.find(
    (balance) => balance.token.denom === props.market.quoteToken.denom
  )
)

const isWHSolUSDTBaseDenom = computed(
  () => props.market.baseToken.denom === usdcTokenDenom.USDCso
)

const { value: orderType, setValue: setOrderType } = useStringField({
  name: TradeField.OrderType,
  initialValue: SpotOrderSide.Sell
})

const isBuy = computed(() => orderType.value === SpotOrderSide.Buy)

function toggleOrderType() {
  setOrderType(isBuy.value ? SpotOrderSide.Sell : SpotOrderSide.Buy)
}

function handleSwap() {
  animationCount.value = animationCount.value + 1

  emit('update:isBase', !props.isBase)

  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: ''
  })

  emit('update:formValue', {
    field: TradeField.QuoteAmount,
    value: ''
  })

  toggleOrderType()
}

function handleUpdateBaseAmount(amount: string) {
  emit('update:isBase', true)
  updateQuoteAmount(amount)
}

function handleUpdateQuoteAmount(amount: string) {
  emit('update:isBase', false)
  updateBaseAmount(amount)
}

function updateQuoteAmount(amount: string) {
  const updatedQuoteAmount = new BigNumberInBase(amount)
    .multipliedBy(props.worstPriceWithSlippage)
    .toFixed(props.market.quantityDecimals, TRADE_FORM_PRICE_ROUNDING_MODE)

  emit('update:formValue', {
    field: TradeField.QuoteAmount,
    value: updatedQuoteAmount
  })
}

function updateBaseAmount(amount: string) {
  const updatedBaseAmount = new BigNumberInBase(amount)
    .dividedBy(props.worstPriceWithSlippage)
    .toFixed(props.market.quantityDecimals, TRADE_FORM_QUANTITY_ROUNDING_MODE)

  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: updatedBaseAmount
  })
}

function handleMaxBaseAmountChange(amount: string) {
  emit('update:isBase', true)

  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: amount
  })

  updateQuoteAmount(amount)
}

function handleMaxQuoteAmountChange(amount: string) {
  emit('update:isBase', false)

  const amountInBigNumber = new BigNumberInBase(amount)

  const feeRateToDeduct = amountInBigNumber.times(takerFeeRate.value)
  const amountDeductFee = amountInBigNumber.minus(feeRateToDeduct)

  const amountDeductFeeToFixed = amountDeductFee.toFixed(
    props.market.priceDecimals,
    TRADE_FORM_PRICE_ROUNDING_MODE
  )

  emit('update:formValue', {
    field: TradeField.QuoteAmount,
    value: amountDeductFeeToFixed
  })

  updateBaseAmount(amountDeductFeeToFixed)
}

watch(
  () => props.worstPriceWithSlippage,
  () => {
    if (props.isBase) {
      if (!props.formValues[TradeField.BaseAmount]) {
        return
      }

      updateQuoteAmount(props.formValues[TradeField.BaseAmount])
    } else {
      if (!props.formValues[TradeField.QuoteAmount]) {
        return
      }
      updateBaseAmount(props.formValues[TradeField.QuoteAmount])
    }
  }
)

onMounted(() => {
  if (!walletStore.hasEnoughInjForGas) {
    modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }
})
</script>

<template>
  <div class="flex flex-col">
    <div
      class="flex justify-between mb-2"
      :class="!isBuy ? 'order-first' : 'order-last'"
    >
      <span class="font-semibold">{{ $t('account.from') }}</span>
      <ModalsConvertUSDCTokenFormPill
        v-if="baseBalance"
        :balance="baseBalance"
      />
    </div>
    <transition :name="!isBuy ? 'fade-up' : 'fade-down'" mode="out-in">
      <div
        :key="animationCount"
        :class="[!isBuy ? 'order-first' : 'order-last']"
      >
        <ModalsConvertUSDCTokenFormInput
          :amount-field-name="TradeField.BaseAmount"
          :balance="baseBalance"
          :required="!isBuy"
          :disabled="isLoading"
          :max-decimals="market?.quantityDecimals"
          @update:model-value="handleUpdateBaseAmount"
          @update:max="handleMaxBaseAmountChange"
        />
      </div>
    </transition>

    <div
      class="flex items-center justify-center my-4 mx-auto bg-blue-500 h-8 w-8 rounded-full"
    >
      <BaseIcon
        :name="isWHSolUSDTBaseDenom ? 'arrow-up-down' : 'arrow'"
        class="mx-auto h-5 w-5"
        :class="{
          '-rotate-90': !isWHSolUSDTBaseDenom,
          'ml-2': isWHSolUSDTBaseDenom
        }"
        @click="handleSwap"
      />
    </div>

    <div
      class="flex justify-between mb-2"
      :class="!isBuy ? 'order-last' : 'order-first'"
    >
      <span class="font-semibold">{{ $t('account.to') }}</span>
      <ModalsConvertUSDCTokenFormPill
        v-if="quoteBalance"
        :balance="quoteBalance"
      />
    </div>
    <transition :name="!isBuy ? 'fade-down' : 'fade-up'" mode="out-in">
      <div
        :key="animationCount"
        :class="[!isBuy ? 'order-last' : 'order-first']"
      >
        <ModalsConvertUSDCTokenFormInput
          :amount-field-name="TradeField.QuoteAmount"
          :balance="quoteBalance"
          :required="isBuy"
          :disabled="isLoading"
          :max-decimals="market?.quantityDecimals"
          @update:model-value="handleUpdateQuoteAmount"
          @update:max="handleMaxQuoteAmountChange"
        />
      </div>
    </transition>
  </div>
</template>
