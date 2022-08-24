<template>
  <div>
    <OrderError
      v-bind="{
        executionPrice,
        lastTradedPrice,
        orderTypeBuy,
        tradingTypeMarket,
        hasError,
        hasInjForGasOrNotKeplr
      }"
    />

    <VButton
      lg
      :outline="disabled"
      :status="status"
      :disabled="disabled"
      :ghost="hasError"
      :green="(!hasInputErrors || hasAdvancedSettingsErrors) && isOrderTypeBuy"
      :red="(!hasInputErrors || hasAdvancedSettingsErrors) && !isOrderTypeBuy"
      class="w-full rounded"
      data-cy="trading-page-execute-button"
      @click.stop="onSubmit"
    >
      {{ buttonLabel }}
    </VButton>

    <VModalOrderConfirm @confirmed="$emit('submit')" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TradeExecutionType, Wallet } from '@injectivelabs/ts-types'
import {
  SpotOrderSide,
  UiSpotMarketWithToken,
  DerivativeOrderSide,
  UiDerivativeMarketWithToken,
  UiDerivativeLimitOrder,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { Identify, identify } from '@amplitude/analytics-browser'
import { AmplitudeEvents, Modal } from '~/types'
import OrderError from '~/components/partials/common/trade/order-error.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import {
  DEFAULT_PRICE_WARNING_DEVIATION,
  BIGGER_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_MAX_NUMBER_OF_ORDERS
} from '~/app/utils/constants'
import {
  AMPLITUDE_VIP_TIER_LEVEL,
  AMPLITUDE_CLICK_PLACE_ORDER_COUNT
} from '~/app/utils/vendor'
import { excludedPriceDeviationSlugs } from '~/app/data/market'

export default Vue.extend({
  components: {
    OrderError,
    VModalOrderConfirm
  },

  props: {
    amount: {
      type: String,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    lastTradedPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    orderType: {
      type: String as PropType<SpotOrderSide | DerivativeOrderSide>,
      required: true
    },

    market: {
      type: Object as PropType<
        UiSpotMarketWithToken | UiDerivativeMarketWithToken
      >,
      required: true
    },

    hasAmount: {
      type: Boolean,
      required: true
    },

    leverage: {
      type: String,
      default: ''
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    hasInputErrors: {
      type: Boolean,
      required: true
    },

    hasAdvancedSettingsErrors: {
      type: Boolean,
      required: true
    },

    orderTypeReduceOnly: {
      type: Boolean,
      default: false
    },

    postOnly: {
      type: Boolean,
      required: true
    },

    price: {
      type: String,
      required: true
    },

    slippageTolerance: {
      type: String,
      required: true
    },

    status: {
      type: Object as PropType<Status>,
      required: true
    },

    tradingType: {
      type: String as PropType<TradeExecutionType>,
      required: true
    },

    tradingTypeStopMarket: {
      type: Boolean,
      required: true
    },

    tradingTypeStopLimit: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      SpotOrderSide,
      DerivativeOrderSide
    }
  },

  computed: {
    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
    },

    marketType(): MarketType {
      const { market } = this

      return market.type
    },

    disabled(): boolean {
      const {
        hasError,
        isUserWalletConnected,
        hasInjForGasOrNotKeplr,
        hasAmount,
        executionPrice
      } = this

      return (
        hasError ||
        !isUserWalletConnected ||
        !hasInjForGasOrNotKeplr ||
        !hasAmount ||
        !executionPrice.gt('0')
      )
    },

    buttonLabel(): string {
      const { orderTypeBuy, marketType } = this

      if (marketType === MarketType.Spot) {
        return orderTypeBuy ? this.$t('trade.buy') : this.$t('trade.sell')
      }

      return orderTypeBuy
        ? this.$t('trade.buyLong')
        : this.$t('trade.sellShort')
    },

    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    isOrderTypeBuy(): boolean {
      const { orderType, SpotOrderSide, DerivativeOrderSide } = this

      return [SpotOrderSide.Buy, DerivativeOrderSide.Buy].includes(orderType)
    },

    hasError(): boolean {
      const { hasAdvancedSettingsErrors, hasInputErrors } = this

      return hasAdvancedSettingsErrors || hasInputErrors
    },

    maxOrdersError(): string | undefined {
      const { orders, tradingTypeMarket, orderType } = this

      const filteredOrders = orders.filter(
        (order) => order.orderSide === orderType
      )

      if (tradingTypeMarket) {
        return undefined
      }

      if (filteredOrders.length >= UI_DEFAULT_MAX_NUMBER_OF_ORDERS) {
        return this.$t('trade.you_can_only_have_max_orders', {
          number: UI_DEFAULT_MAX_NUMBER_OF_ORDERS
        })
      }

      return undefined
    },

    hasInjForGasOrNotKeplr(): boolean {
      const { wallet, hasEnoughInjForGas } = this

      if (wallet !== Wallet.Keplr) {
        return true
      }

      return hasEnoughInjForGas
    },

    priceHasHighDeviationWarning(): boolean {
      const {
        executionPrice,
        orderTypeBuy,
        orderTypeReduceOnly,
        tradingTypeMarket,
        market,
        lastTradedPrice
      } = this

      if (!market || tradingTypeMarket || executionPrice.lte(0)) {
        return false
      }

      if (orderTypeReduceOnly) {
        return false
      }

      const defaultPriceWarningDeviation = excludedPriceDeviationSlugs.includes(
        market.ticker
      )
        ? BIGGER_PRICE_WARNING_DEVIATION
        : DEFAULT_PRICE_WARNING_DEVIATION

      const deviation = new BigNumberInBase(1)
        .minus(
          orderTypeBuy
            ? lastTradedPrice.dividedBy(executionPrice)
            : executionPrice.dividedBy(lastTradedPrice)
        )
        .times(100)

      return deviation.gt(defaultPriceWarningDeviation)
    }
  },

  methods: {
    handleClickPlaceOrderTrack() {
      const identifyObj = new Identify()
      identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, this.tierLevel)
      identifyObj.add(AMPLITUDE_CLICK_PLACE_ORDER_COUNT, 1)
      identify(identifyObj)

      this.$amplitude.track(AmplitudeEvents.ClickPlaceOrder, {
        amount: this.amount,
        market: this.market.slug,
        marketType: this.market.subType,
        orderType: this.orderType,
        postOnly: this.postOnly,
        tradingType: this.tradingType,
        leverage:
          this.market.subType === MarketType.Perpetual ? this.leverage : '',
        triggerPrice:
          this.tradingTypeStopMarket || this.tradingTypeStopLimit ? '' : '',
        reduceOnly: this.market.subType === MarketType.Perpetual ? '' : '',
        limitPrice: !this.tradingTypeMarket ? this.price : '',
        slippageTolerance: this.tradingTypeMarket ? this.slippageTolerance : ''
      })
    },

    onSubmit() {
      const {
        hasError,
        maxOrdersError,
        priceHasHighDeviationWarning,
        isUserWalletConnected
      } = this

      this.handleClickPlaceOrderTrack()

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasError) {
        return this.$toast.error(this.$t('trade.error_in_form'))
      }

      if (maxOrdersError) {
        return this.$toast.error(maxOrdersError)
      }

      if (priceHasHighDeviationWarning) {
        return this.$accessor.modal.openModal(Modal.OrderConfirm)
      }

      this.$emit('submit')
    }
  }
})
</script>
