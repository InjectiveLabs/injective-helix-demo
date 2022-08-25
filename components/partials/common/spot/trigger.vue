<template>
  <tr
    v-if="market"
    :data-cy="'spot-order-table-row-' + market.ticker"
    :data-cy-hash="trigger.orderHash"
  >
    <td class="h-8 text-left cursor-pointer" @click="handleClickOnMarket">
      <div class="flex items-center justify-start">
        <div v-if="baseTokenLogo" class="w-6 h-6">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>

        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="spot-order-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-8 text-left">
      <span class="text-white text-xs">
        {{ type }}
      </span>
    </td>

    <td class="h-8 text-left">
      <span
        data-cy="spot-order-order-side-table-data"
        class="text-xs"
        :class="{
          'text-green-500': isBuy,
          'text-red-500': !isBuy
        }"
      >
        {{ orderSideLocalized }}
      </span>
    </td>

    <td class="h-8 text-right">
      <span v-if="isMarketOrder" class="text-white text-xs">
        {{ $t('trade.market') }}
      </span>

      <VNumber
        v-else
        xs
        data-cy="spot-order-price-table-data"
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="price"
      />
    </td>

    <td class="h-8 text-right font-mono">
      <VNumber
        xs
        data-cy="spot-order-quantity-table-data"
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="total"
      />
    </td>

    <td class="h-8 text-right">
      <span class="text-white text-xs">
        Unfilled
      </span>
    </td>

    <td class="h-8 text-right">
      <span class="text-white text-xs">
        Filled
      </span>
    </td>

    <td class="h-8 text-right font-mono">
      <VNumber
        xs
        data-cy="spot-order-filled-quantity-table-data"
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      >
        <span slot="addon" class="text-xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </VNumber>
    </td>

    <td class="h-12 flex items-center justify-end gap-1">
      <template v-if="isMarketOrder">
        <span class="text-white text-xs">
          &mdash;
        </span>
      </template>

      <template v-else>
        <span class="text-gray-500 text-xs font-semibold"> Mark Price </span>

        <span class="text-white text-xs font-semibold"> ≤ </span>

        <VNumber
          xs
          data-cy="spot-order-total-table-data"
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="triggerPrice"
        />
      </template>
    </td>

    <td class="h-8 relative text-right">
      <div class="flex items-center justify-end">
        <span
          v-if="false"
          class="cursor-pointer text-primary-500 mr-6"
          data-cy="spot-order-view-link"
          @click="handleClickOnMarket"
        >
          {{ $t('common.view') }}
        </span>

        <VButton
          v-if="orderFillable"
          :status="status"
          data-cy="spot-order-cancel-link"
          class="rounded w-6 h-6"
          @click="onCancelOrder"
        >
          <div
            class="flex items-center justify-center rounded-full w-6 h-6 bg-red-500 bg-opacity-10 text-red-500 hover:bg-red-600 hover:text-red-600 hover:bg-opacity-10"
          >
            <IconBin />
          </div>
        </VButton>
        <span v-else class="inline-block">&mdash;</span>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  SpotOrderSide,
  ZERO_IN_BASE,
  getTokenLogoWithVendorPathPrefix,
  UiSpotOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  props: {
    trigger: {
      required: true,
      type: Object as PropType<UiSpotOrderHistory>
    }
  },

  data() {
    return {
      SpotOrderSide,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      status: new Status()
    }
  },

  computed: {
    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    market(): UiSpotMarketWithToken | undefined {
      const { markets, trigger } = this

      return markets.find((m) => m.marketId === trigger.marketId)
    },

    isBinaryOptionsPage(): boolean {
      return this.$route.name === 'binary-options-binaryOption'
    },

    isMarketOrder(): boolean {
      const { trigger } = this

      return trigger.executionType === 'market'
    },

    price(): BigNumberInBase {
      const { market, trigger } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trigger.price).toBase(
        market.quoteToken.decimals
      )
    },

    triggerPrice(): BigNumberInBase {
      const { trigger, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trigger.triggerPrice).toBase(
        market.quoteToken.decimals
      )
    },

    margin(): BigNumberInBase {
      return ZERO_IN_BASE
      // const { market, trigger } = this

      // if (!market) {
      //   return ZERO_IN_BASE
      // }

      // return new BigNumberInWei(trigger.margin).toBase(
      //   market.quoteToken.decimals
      // )
    },

    quantity(): BigNumberInBase {
      const { market, trigger } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(trigger.quantity)
    },

    quantityToFormat(): string {
      const { market, quantity } = this

      if (!market) {
        return quantity.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      return quantity.toFormat(market.quantityDecimals)
    },

    unfilledQuantity(): BigNumberInBase {
      const { market, quantity, filledQuantity } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return quantity.minus(filledQuantity)
    },

    filledQuantity(): BigNumberInBase {
      const { trigger } = this

      return new BigNumberInBase(trigger.filledQuantity)
    },

    filledQuantityPercentage(): BigNumberInBase {
      const { filledQuantity, quantity, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (filledQuantity.lte(0)) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(filledQuantity.dividedBy(quantity))
    },

    orderFullyFilled(): boolean {
      const { unfilledQuantity } = this

      return unfilledQuantity.isZero()
    },

    orderFillable(): boolean {
      const { unfilledQuantity, quantity } = this

      return unfilledQuantity.lte(quantity)
    },

    total(): BigNumberInBase {
      const { price, quantity } = this

      return price.multipliedBy(quantity)
    },

    orderSideLocalized(): string {
      const { isBuy } = this

      return isBuy ? this.$t('trade.buy') : this.$t('trade.sell')
    },

    baseTokenLogo(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (!market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    },

    isBuy(): boolean {
      const { trigger } = this

      switch (trigger.orderType) {
        case SpotOrderSide.TakeBuy:
        case SpotOrderSide.StopBuy:
        case SpotOrderSide.Buy:
          return true
        default:
          return false
      }
    },

    type(): string {
      const { trigger } = this

      const orderType =
        trigger.orderType === ('take_sell' || 'take_buy')
          ? this.$t('trade.takeProfit')
          : this.$t('trade.stopLoss')

      const executionType =
        trigger.executionType === 'market'
          ? this.$t('trade.market')
          : this.$t('trade.limit')

      return `${orderType} ${executionType}`
    }
  },

  methods: {
    onCancelOrder(): void {
      this.status.setLoading()

      this.$accessor.spot
        .cancelOrder(this.trigger)
        .then(() => {
          this.$toast.success(this.$t('trade.order_success_canceling'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleClickOnMarket() {
      const { market } = this

      if (!market) {
        return
      }

      return this.$router.push({ ...getMarketRoute(market) })
    }
  }
})
</script>
