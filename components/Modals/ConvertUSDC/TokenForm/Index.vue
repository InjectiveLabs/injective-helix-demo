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
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'
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
  (
    e: 'update:amount',
    { amount, isBase }: { amount: string; isBase: boolean }
  ): void
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
  if (!isWHSolUSDTBaseDenom.value) {
    return
  }

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

function updateAmount({ amount, isBase }: { amount: string; isBase: boolean }) {
  emit('update:amount', { amount, isBase })
}

function handleMaxBaseAmountChange(amount: string) {
  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: amount
  })

  updateAmount({ amount, isBase: true })
}

function handleMaxQuoteAmountChange(amount: string) {
  const amountInBigNumber = new BigNumberInBase(amount)

  const feeRateToDeduct = amountInBigNumber.times(takerFeeRate.value)
  const amountDeductFee = amountInBigNumber.minus(feeRateToDeduct)

  const amountDeductFeeToFixed = amountDeductFee.toFixed(
    props.market.priceDecimals,
    TRADE_FORM_PRICE_ROUNDING_MODE
  )

  emit('update:formValue', {
    field: TradeField.BaseAmount,
    value: amountDeductFeeToFixed
  })

  emit('update:amount', { amount: amountDeductFeeToFixed, isBase: false })
}

watch(
  () => props.worstPriceWithSlippage,
  () => {
    emit('update:amount', {
      amount: props.isBase
        ? props.formValues[TradeField.BaseAmount]
        : props.formValues[TradeField.QuoteAmount],
      isBase: props.isBase
    })
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
    <transition :name="!isBuy ? 'fade-up' : 'fade-down'" mode="out-in">
      <div
        :key="animationCount"
        :class="[!isBuy ? 'order-first' : 'order-last']"
      >
        <div
          class="flex justify-between mb-2"
          :class="!isBuy ? 'order-first' : 'order-last'"
        >
          <span class="font-semibold">{{
            !isBuy ? $t('account.from') : $t('account.to')
          }}</span>

          <ModalsConvertUSDCTokenFormPill
            v-if="baseBalance"
            :balance="baseBalance"
          />
        </div>

        <ModalsConvertUSDCTokenFormInput
          v-if="baseBalance"
          :amount-field-name="TradeField.BaseAmount"
          :balance="baseBalance"
          :required="!isBuy"
          :disabled="isLoading"
          :max-decimals="market?.quantityDecimals"
          @update:amount="updateAmount"
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

    <transition :name="!isBuy ? 'fade-down' : 'fade-up'" mode="out-in">
      <div
        :key="animationCount"
        :class="[!isBuy ? 'order-last' : 'order-first']"
      >
        <div
          class="flex justify-between mb-2"
          :class="!isBuy ? 'order-last' : 'order-first'"
        >
          <span class="font-semibold">{{
            isBuy ? $t('account.from') : $t('account.to')
          }}</span>
          <ModalsConvertUSDCTokenFormPill
            v-if="quoteBalance"
            :balance="quoteBalance"
          />
        </div>

        <ModalsConvertUSDCTokenFormInput
          v-if="quoteBalance"
          :amount-field-name="TradeField.QuoteAmount"
          :balance="quoteBalance"
          :required="isBuy"
          :disabled="isLoading"
          :max-decimals="market?.quantityDecimals"
          @update:amount="updateAmount"
          @update:max="handleMaxQuoteAmountChange"
        />
      </div>
    </transition>
  </div>
</template>
