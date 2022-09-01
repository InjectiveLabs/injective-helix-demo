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

    <VModalOrderConfirm @confirmed="handleTradeConfirmationModalConfirm" />
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
  UiSpotLimitOrder,
  MarketType,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import OrderError from '~/components/partials/common/trade/order-error.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    OrderError,
    VModalOrderConfirm
  },

  props: {
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

    hasTriggerPrice: {
      type: Boolean,
      required: true
    },

    triggerPriceEqualsMarkPrice: {
      type: Boolean,
      required: true
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    orderTypeToSubmit: {
      type: String as PropType<SpotOrderSide | DerivativeOrderSide>,
      required: true
    },

    tradingType: {
      type: String as PropType<TradeExecutionType>,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    tradingTypeLimit: {
      type: Boolean,
      required: true
    },

    tradingTypeStopMarket: {
      type: Boolean,
      required: true
    },

    tradingTypeStopLimit: {
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

    status: {
      type: Object as PropType<Status>,
      required: true
    },

    isConditionalOrder: {
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
    isSpot(): boolean {
      return this.$route.name === 'spot-spot'
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
        hasTriggerPrice,
        triggerPriceEqualsMarkPrice,
        executionPrice,
        isSpot,
        isConditionalOrder
      } = this

      const commonErrors =
        hasError ||
        !isUserWalletConnected ||
        !hasInjForGasOrNotKeplr ||
        !hasAmount

      if (commonErrors) {
        return true
      }

      const isPerpConditionalOrderWithoutTriggerPrice =
        !isSpot && isConditionalOrder && !hasTriggerPrice

      if (isPerpConditionalOrderWithoutTriggerPrice) {
        return true
      }

      const isPerpConditionalOrderWithIncorrectTriggerPrice =
        !isSpot && isConditionalOrder && triggerPriceEqualsMarkPrice

      if (isPerpConditionalOrderWithIncorrectTriggerPrice) {
        return true
      }

      if (executionPrice.lte(0) && !this.tradingTypeStopMarket) {
        return true
      }

      return false
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

    derivativeOrders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    conditionalOrders(): UiDerivativeOrderHistory[] {
      return this.$accessor.derivatives.subaccountConditionalOrders
    },

    spotOrders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    },

    filteredDerivativeOrders(): UiDerivativeLimitOrder[] {
      const { market, orderType, derivativeOrders } = this

      return derivativeOrders.filter(
        (order) =>
          order.orderSide === orderType && order.marketId === market.marketId
      )
    },

    filteredConditionalOrders(): UiDerivativeOrderHistory[] {
      const { market, orderType, conditionalOrders } = this

      return conditionalOrders.filter(
        (order) =>
          order.direction === orderType && order.marketId === market.marketId
      )
    },

    filteredSpotOrders(): UiSpotLimitOrder[] {
      const { market, orderType, spotOrders } = this

      return spotOrders.filter(
        (order) =>
          order.orderSide === orderType && order.marketId === market.marketId
      )
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
      const {
        isSpot,
        filteredDerivativeOrders,
        filteredSpotOrders,
        filteredConditionalOrders,
        tradingTypeMarket
      } = this

      const filteredOrders = isSpot
        ? filteredSpotOrders
        : [...filteredDerivativeOrders, ...filteredConditionalOrders]

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
    }
  },

  methods: {
    onSubmit() {
      const { hasError, isUserWalletConnected, maxOrdersError } = this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasError) {
        return this.$toast.error(this.$t('trade.error_in_form'))
      }

      if (maxOrdersError) {
        return this.$toast.error(maxOrdersError)
      }

      this.$emit('submit:request')
    },

    handleTradeConfirmationModalConfirm() {
      this.$emit('submit')
    }
  }
})
</script>
