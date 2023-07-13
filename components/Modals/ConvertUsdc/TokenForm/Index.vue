<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { AccountBalance, TradeField, TradeForm } from '@/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'
import { usdcTokenDenom } from '@/app/data/token'

const formValues = useFormValues<TradeForm>()

const props = defineProps({
  isLoading: Boolean,
  isBaseAmount: Boolean,

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  balances: {
    type: Object as PropType<AccountBalance[]>,
    required: true
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:isBaseAmount', state: boolean): void
  (
    e: 'update:amount',
    { amount, isBaseAmount }: { amount: string; isBaseAmount: boolean }
  ): void
}>()

const animationCount = ref(0)

const { takerFeeRate } = useTradeFee(computed(() => props.market))

const baseBalance = computed(() =>
  props.balances.find(
    (balance) => balance.token.denom === props.market.baseDenom
  )
)

const baseAvailableBalance = computed(() =>
  new BigNumberInWei(baseBalance.value?.availableMargin || 0).toFixed()
)

const baseBalanceToBase = computed(() =>
  new BigNumberInWei(baseBalance.value?.availableMargin || 0)
    .toBase(baseBalance.value?.token.decimals)
    .toFixed()
)

const quoteBalance = computed(() =>
  props.balances.find(
    (balance) => balance.token.denom === props.market.quoteDenom
  )
)

const quoteAvailableBalance = computed(() =>
  new BigNumberInWei(quoteBalance.value?.availableMargin || 0).toFixed()
)

const isWHSolUSDTBaseDenom = computed(
  () => props.market.baseDenom === usdcTokenDenom.USDCso
)

const isBuy = computed(() => orderSide.value === OrderSide.Buy)

const { valueToFixed: maxBalanceToFixed } = useBigNumberFormatter(
  baseBalanceToBase,
  {
    decimalPlaces: props.market?.quantityDecimals
  }
)

const { value: orderSide, setValue: setOrderSide } = useStringField({
  name: TradeField.OrderSide,
  initialValue: OrderSide.Sell
})

watch(
  () => props.worstPriceWithSlippage,
  () => {
    emit('update:amount', {
      amount: props.isBaseAmount
        ? formValues.value[TradeField.BaseAmount]
        : formValues.value[TradeField.QuoteAmount],
      isBaseAmount: props.isBaseAmount
    })
  }
)

onMounted(() => {
  if ([usdcTokenDenom.USDC].includes(baseBalance.value?.denom || '')) {
    handleMaxBaseAmountChange({
      amount: maxBalanceToFixed.value
    })
  }
})

function toggleOrderSide() {
  setOrderSide(isBuy.value ? OrderSide.Sell : OrderSide.Buy)
}

function handleSwap() {
  if (!isWHSolUSDTBaseDenom.value) {
    return
  }

  animationCount.value = animationCount.value + 1

  emit('update:isBaseAmount', !props.isBaseAmount)

  formValues.value[TradeField.BaseAmount] = ''
  formValues.value[TradeField.QuoteAmount] = ''

  toggleOrderSide()
}

function updateAmount({
  amount,
  isBaseAmount
}: {
  amount: string
  isBaseAmount: boolean
}) {
  emit('update:amount', { amount, isBaseAmount })
}

function handleMaxBaseAmountChange({ amount }: { amount: string }) {
  formValues.value[TradeField.BaseAmount] = amount

  updateAmount({ amount, isBaseAmount: true })
}

function handleMaxQuoteAmountChange({ amount }: { amount: string }) {
  const amountInBigNumber = new BigNumberInBase(amount)

  const feeRateToDeduct = amountInBigNumber.times(takerFeeRate.value)
  const amountDeductFee = amountInBigNumber.minus(feeRateToDeduct)

  const amountDeductFeeToFixed = amountDeductFee.toFixed(
    props.market.priceDecimals,
    TRADE_FORM_PRICE_ROUNDING_MODE
  )

  formValues.value[TradeField.BaseAmount] = amountDeductFeeToFixed

  emit('update:amount', { amount: amountDeductFeeToFixed, isBaseAmount: false })
}
</script>

<template>
  <div class="flex flex-col">
    <transition :name="!isBuy ? 'fade-up' : 'fade-down'" mode="out-in">
      <div
        :key="`animation-${animationCount}`"
        :class="[!isBuy ? 'order-first' : 'order-last']"
      >
        <div
          class="flex justify-between mb-2"
          :class="!isBuy ? 'order-first' : 'order-last'"
        >
          <span class="font-semibold">{{
            !isBuy ? $t('account.from') : $t('account.to')
          }}</span>

          <ModalsConvertUsdcTokenFormPill
            v-if="baseBalance"
            :balance="baseBalance"
          />
        </div>

        <AppSelectToken
          v-if="baseBalance"
          v-bind="{
            denom: baseBalance.denom,
            amountFieldName: TradeField.BaseAmount,
            disabled: isLoading,
            required: !isBuy,
            hideMax: isBuy,
            maxDecimals: market?.quantityDecimals,
            options: [
              {
                token: baseBalance.token,
                denom: baseBalance.denom,
                balance: baseAvailableBalance
              }
            ]
          }"
          @update:amount="updateAmount"
          @update:max="handleMaxBaseAmountChange"
        >
          <span>
            {{ $t(`trade.convert.${isBuy ? 'youReceive' : 'youPay'}`) }}
          </span>
        </AppSelectToken>
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
        :key="`animation-${animationCount}`"
        :class="[!isBuy ? 'order-last' : 'order-first']"
      >
        <div
          class="flex justify-between mb-2"
          :class="!isBuy ? 'order-last' : 'order-first'"
        >
          <span class="font-semibold">{{
            isBuy ? $t('account.from') : $t('account.to')
          }}</span>
          <ModalsConvertUsdcTokenFormPill
            v-if="quoteBalance"
            :balance="quoteBalance"
          />
        </div>

        <AppSelectToken
          v-if="quoteBalance"
          v-bind="{
            denom: quoteBalance.denom,
            amountFieldName: TradeField.QuoteAmount,
            disabled: isLoading,
            required: isBuy,
            hideMax: !isBuy,
            maxDecimals: market?.quantityDecimals,
            options: [
              {
                token: quoteBalance.token,
                denom: quoteBalance.denom,
                balance: quoteAvailableBalance
              }
            ]
          }"
          @update:amount="updateAmount"
          @update:max="handleMaxQuoteAmountChange"
        >
          <span>
            {{ $t(`trade.convert.${isBuy ? 'youPay' : 'youReceive'}`) }}
          </span>
        </AppSelectToken>
      </div>
    </transition>
  </div>
</template>
