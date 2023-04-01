<script lang="ts" setup>
import { PropType } from 'vue'
import {
  BalanceWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { Modal, TradeField, TradeForm } from '@/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'

const route = useRoute()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const modalStore = useModalStore()
const tokenStore = useTokenStore()

const formValues = useFormValues<TradeForm>()

const props = defineProps({
  isLoading: Boolean,
  isBaseAmount: Boolean,

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    default: () => null
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:isBaseAmount', state: boolean): void
  (e: 'update:market', state: UiSpotMarketWithToken): void
  (
    e: 'update:amount',
    { amount, isBaseAmount }: { amount: string; isBaseAmount: boolean }
  ): void
}>()

const animationCount = ref(0)

const { takerFeeRate } = useTradeFee(computed(() => props.market))

const { accountBalancesWithToken } = useBalance()
const { tradableSlugMap, tradableTokensMap, getMarketsForQuoteDenom } =
  useConvertFormatter()

const isBuy = computed(() => orderType.value === OrderSide.Buy)

const { value: baseTokenDenom, setValue: setBaseTokenDenom } = useStringField({
  name: TradeField.BaseDenom
})

const { value: quoteTokenDenom, setValue: setQuoteTokenDenom } = useStringField(
  {
    name: TradeField.QuoteDenom
  }
)

const baseTokens = computed(
  () => tradableTokensMap.value[baseTokenDenom.value] || []
)

const quoteTokens = computed(
  () => tradableTokensMap.value[quoteTokenDenom.value] || []
)

const baseTokensWithBalance = computed(() => {
  return baseTokens.value.map((baseToken) => {
    const accountBalance = accountBalancesWithToken.value.find(
      (accountBalance) => {
        return accountBalance.denom === baseToken.denom
      }
    )

    return {
      token: baseToken,
      denom: baseToken.denom,
      balance: accountBalance?.availableMargin || '0',
      usdPrice: tokenStore.tokenUsdPrice(baseToken.coinGeckoId)
    } as BalanceWithToken
  })
})

const quoteTokensWithBalance = computed(() => {
  return quoteTokens.value.map((quoteToken) => {
    const accountBalance = accountBalancesWithToken.value.find(
      (accountBalance) => {
        return accountBalance.denom === quoteToken.denom
      }
    )

    return {
      token: quoteToken,
      denom: quoteToken.denom,
      balance: accountBalance?.availableMargin || '0',
      usdPrice: tokenStore.tokenUsdPrice(quoteToken.coinGeckoId)
    } as BalanceWithToken
  })
})

const { value: orderType, setValue: setOrderSide } = useStringField({
  name: TradeField.OrderSide,
  initialValue: OrderSide.Buy
})

onMounted(() => {
  if (!accountStore.hasEnoughInjForGas) {
    modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }

  setMarketFromQuery()
})

function handleUpdateMarket() {
  let market = [
    ...spotStore.markets,
    ...spotStore.usdcConversionModalMarkets
  ].find(({ baseDenom, quoteDenom }) => {
    return (
      baseDenom === baseTokenDenom.value && quoteDenom === quoteTokenDenom.value
    )
  })

  if (!market) {
    market = getMarketsForQuoteDenom({
      baseTokenDenom: baseTokenDenom.value,
      quoteTokenDenom: quoteTokenDenom.value
    })

    setBaseTokenDenom(market.baseDenom)
    setQuoteTokenDenom(market.quoteDenom)
  }

  if (market) {
    emit('update:market', market)
  }
}

function toggleOrderSide() {
  setOrderSide(isBuy.value ? OrderSide.Sell : OrderSide.Buy)
}

function handleSwap() {
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

  formValues.value[TradeField.QuoteAmount] = amountDeductFeeToFixed

  emit('update:amount', { amount: amountDeductFeeToFixed, isBaseAmount: false })
}

function setMarketFromQuery() {
  const { to, from } = route.query
  const querySlug = `${from}-${to}`

  const { market, orderType } =
    tradableSlugMap.value[querySlug.toLowerCase()] ||
    tradableSlugMap.value['usdt-inj']

  if (!market) {
    return
  }

  emit('update:market', market)
  setOrderSide(orderType)
  setBaseTokenDenom(market.baseDenom)
  setQuoteTokenDenom(market.quoteDenom)
}

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
</script>

<template>
  <div class="flex flex-col">
    <transition :name="isBuy ? 'fade-up' : 'fade-down'" mode="out-in">
      <div
        :key="`animation-${animationCount}`"
        :class="[isBuy ? 'order-first' : 'order-last']"
      >
        <AppSelectToken
          v-model:denom="quoteTokenDenom"
          :amount-field-name="TradeField.QuoteAmount"
          :required="isBuy"
          :disabled="isLoading"
          :hide-max="!isBuy"
          :max-decimals="market?.quantityDecimals"
          :options="baseTokensWithBalance"
          @update:amount="updateAmount"
          @update:denom="handleUpdateMarket"
          @update:max="handleMaxQuoteAmountChange"
        >
          <span>
            {{ $t(`trade.convert.${isBuy ? 'youPay' : 'youReceive'}`) }}
          </span>
        </AppSelectToken>
      </div>
    </transition>

    <div class="my-4">
      <BaseIcon
        name="arrow-up-down"
        class="mx-auto w-6 h-6"
        @click="handleSwap"
      />
    </div>

    <transition :name="isBuy ? 'fade-down' : 'fade-up'" mode="out-in">
      <div
        :key="`animation-${animationCount}`"
        :class="[isBuy ? 'order-last' : 'order-first']"
      >
        <AppSelectToken
          v-model:denom="baseTokenDenom"
          :amount-field-name="TradeField.BaseAmount"
          :disabled="isLoading"
          :required="!isBuy"
          :hide-max="isBuy"
          :max-decimals="market?.quantityDecimals"
          :options="quoteTokensWithBalance"
          @update:amount="updateAmount"
          @update:max="handleMaxBaseAmountChange"
          @update:denom="handleUpdateMarket"
        >
          <span>
            {{ $t(`trade.convert.${isBuy ? 'youReceive' : 'youPay'}`) }}
          </span>
        </AppSelectToken>
      </div>
    </transition>
  </div>
</template>
