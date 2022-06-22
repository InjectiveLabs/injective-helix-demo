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
      :aqua="
        (!hasInputErrors || hasAdvancedSettingsErrors) &&
        orderType === SpotOrderSide.Buy
      "
      :red="
        (!hasInputErrors || hasAdvancedSettingsErrors) &&
        orderType === SpotOrderSide.Sell
      "
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
import { SpotOrderSide, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
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
      type: String as PropType<SpotOrderSide>,
      required: true
    },

    market: {
      type: Object as PropType<UiSpotMarketWithToken>,
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

    status: {
      type: Object as PropType<Status>,
      required: true
    }
  },

  data() {
    return {
      SpotOrderSide
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

    hasError(): boolean {
      const { hasAdvancedSettingsErrors, hasInputErrors } = this

      return hasAdvancedSettingsErrors || hasInputErrors
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
        tradingTypeMarket,
        market,
        lastTradedPrice
      } = this

      if (!market) {
        return false
      }

      if (tradingTypeMarket) {
        return false
      }

      if (executionPrice.lte(0)) {
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
    submit() {
      const { hasError, priceHasHighDeviationWarning, isUserWalletConnected } =
        this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasError) {
        return this.$toast.error(this.$t('trade.error_in_form'))
      }

      if (priceHasHighDeviationWarning) {
        return this.$accessor.modal.openModal(Modal.OrderConfirm)
      }

      this.$emit('submit')
    }
  }
})
</script>
