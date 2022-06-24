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
      :status="status"
      :disabled="hasError || !isUserWalletConnected || !hasInjForGasOrNotKeplr"
      :ghost="hasError"
      :aqua="(!hasInputErrors || hasAdvancedSettingsErrors) && isOrderTypeBuy"
      :red="(!hasInputErrors || hasAdvancedSettingsErrors) && isOrderTypeSell"
      class="w-full"
      data-cy="trading-page-execute-button"
      @click.stop="onSubmit"
    >
      {{ $t(orderTypeBuy ? 'trade.buy' : 'trade.sell') }}
    </VButton>
    <VModalOrderConfirm @confirmed="$emit('submit')" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Wallet } from '@injectivelabs/ts-types'
import {
  SpotOrderSide,
  UiSpotMarketWithToken,
  DerivativeOrderSide,
  UiDerivativeMarketWithToken,
  UiDerivativeLimitOrder
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { Modal } from '~/types'
import OrderError from '~/components/partials/common/trade/order-error.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import {
  DEFAULT_PRICE_WARNING_DEVIATION,
  BIGGER_PRICE_WARNING_DEVIATION
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

    reduceOnly: {
      type: Boolean,
      default: false
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

      return (
        orderType === SpotOrderSide.Buy || orderType === DerivativeOrderSide.Buy
      )
    },

    isOrderTypeSell(): boolean {
      const { orderType, SpotOrderSide, DerivativeOrderSide } = this

      return (
        orderType === SpotOrderSide.Sell ||
        orderType === DerivativeOrderSide.Sell
      )
    },

    hasError(): boolean {
      const { hasAdvancedSettingsErrors, hasInputErrors } = this

      return hasAdvancedSettingsErrors || hasInputErrors
    },

    maxOrdersError(): string | undefined {
      const { orders, tradingTypeMarket, orderType } = this
      const MAX_NUMBER_OF_ORDERS = 20
      const filteredOrders = orders.filter(
        (order) => order.orderSide === orderType
      )

      if (tradingTypeMarket) {
        return undefined
      }

      if (filteredOrders.length >= MAX_NUMBER_OF_ORDERS) {
        return this.$t('trade.you_can_only_have_max_orders', {
          number: MAX_NUMBER_OF_ORDERS
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

      if (!market || !tradingTypeMarket || executionPrice.lte(0)) {
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
        isUserWalletConnected
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
        return this.$accessor.modal.openModal(Modal.OrderConfirm)
      }

      this.$emit('submit')
    }
  }
})
</script>
