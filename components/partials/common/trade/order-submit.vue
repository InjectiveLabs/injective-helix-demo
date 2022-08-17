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
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { Modal } from '~/types'
import OrderError from '~/components/partials/common/trade/order-error.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import {
  DEFAULT_PRICE_WARNING_DEVIATION,
  BIGGER_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_MAX_NUMBER_OF_ORDERS
} from '~/app/utils/constants'
import { excludedPriceDeviationSlugs } from '~/app/data/market'

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
    }
  },

  data() {
    return {
      SpotOrderSide,
      DerivativeOrderSide
    }
  },

  computed: {
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
    onSubmit() {
      const {
        hasError,
        maxOrdersError,
        priceHasHighDeviationWarning,
        isUserWalletConnected,
        orderTypeToSubmit: orderType,
        tradingType,
        tradingTypeStopMarket,
        tradingTypeStopLimit
      } = this

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
        return this.$accessor.modal.openModal({
          type: Modal.OrderConfirm
        })
      }

      if (tradingTypeStopMarket || tradingTypeStopLimit) {
        return this.$accessor.modal.openModal({
          type: Modal.OrderConfirm,
          data: {
            tradingType,
            orderType
          }
        })
      }

      this.$emit('submit')
    }
  }
})
</script>
