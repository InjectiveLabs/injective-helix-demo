<template>
  <table-row v-if="market" dense>
    <div class="pb-1 col-span-2" @click="handleClickOnMarket">
      <div class="flex items-center justify-between text-xs leading-5">
        <div class="flex items-center gap-1">
          <span
            :class="{
              'text-green-500': isBuy,
              'text-red-500': !isBuy
            }"
          >
            {{ orderSideLocalized }}
          </span>
          <div v-if="baseTokenLogo" class="w-4 h-4">
            <img
              :src="baseTokenLogo"
              :alt="market.baseToken.name"
              class="min-w-full h-auto rounded-full"
            />
          </div>
          <span class="text-gray-200 font-semibold">
            {{ market.ticker }}
          </span>
        </div>

        <VButton
          v-if="orderFillable"
          class="cursor-pointer rounded"
          :status="status"
          @click.stop="onCancelOrder"
        >
          <div
            class="flex items-center justify-center rounded-full bg-opacity-10 w-5 h-5 hover:bg-opacity-10 bg-red-500 text-red-500"
          >
            <IconBin class="h-3 w-3" />
          </div>
        </VButton>
      </div>
      <div
        v-if="false"
        class="mt-0.5 text-gray-500 uppercase tracking-widest text-2xs"
      >
        {{ $t('trade.post_only') }}
      </div>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.price') }}
    </span>
    <div class="text-right">
      <VNumber
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="price"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.filled') }} / {{ $t('trade.amount') }}
    </span>
    <div class="flex items-center gap-1 justify-end">
      <VNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="filledQuantity"
      />
      <span>/</span>
      <VNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.total') }}
    </span>
    <div class="text-right">
      <VNumber
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="total"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </VNumber>
    </div>
  </table-row>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  getTokenLogoWithVendorPathPrefix,
  SpotOrderSide,
  UiSpotMarketWithToken,
  UiSpotOrderHistory,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import TableRow from '~/components/elements/table-row.vue'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    order: {
      required: true,
      type: Object as PropType<UiSpotOrderHistory>
    }
  },

  data() {
    return {
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      SpotOrderSide,
      status: new Status(),
      statusTest: new Status(StatusType.Loading)
    }
  },

  computed: {
    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    market(): UiSpotMarketWithToken | undefined {
      const { markets, order } = this

      return markets.find((m) => m.marketId === order.marketId)
    },

    price(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(order.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    },

    quantity(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(cosmosSdkDecToBigNumber(order.quantity))
    },

    unfilledQuantity(): BigNumberInBase {
      const { market, quantity, filledQuantity } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return quantity.minus(filledQuantity)
    },

    filledQuantity(): BigNumberInBase {
      const { order } = this

      return new BigNumberInBase(cosmosSdkDecToBigNumber(order.filledQuantity))
    },

    orderFillable(): boolean {
      const { unfilledQuantity, quantity } = this

      return unfilledQuantity.lte(quantity)
    },

    total(): BigNumberInBase {
      const { price, quantity } = this

      return quantity.multipliedBy(price)
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
      const { order } = this

      if (order.direction === SpotOrderSide.Buy) {
        return true
      }

      switch (order.orderType) {
        case SpotOrderSide.TakeBuy:
        case SpotOrderSide.StopBuy:
        case SpotOrderSide.Buy:
        case SpotOrderSide.BuyPO:
          return true
        default:
          return false
      }
    }
  },

  methods: {
    onCancelOrder(): void {
      this.status.setLoading()

      this.$accessor.spot
        .cancelOrder(this.order)
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

      return this.$router.push(getMarketRoute(market))
    }
  }
})
</script>
