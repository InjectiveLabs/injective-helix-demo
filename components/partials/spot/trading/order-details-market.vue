<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <v-drawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between">
        <v-text-info :title="$t('total')" lg>
          <span class="font-mono flex items-center">
            <span class="mr-1">≈</span>
            {{ extractedTotalToFormat }}
            <span class="text-gray-500 ml-1">
              {{
                orderTypeBuy
                  ? market.quoteToken.symbol
                  : market.baseToken.symbol
              }}
            </span>
          </span>
        </v-text-info>
      </p>

      <div class="mt-4">
        <v-text-info :title="$t('amount')">
          <span v-if="!amount.isNaN()" class="font-mono flex items-center">
            {{ amountToFormat }}
            <span class="text-gray-500 ml-1">
              {{
                orderTypeBuy
                  ? market.quoteToken.symbol
                  : market.baseToken.symbol
              }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info
          v-if="!orderTypeBuy"
          :title="$t('est_receiving_amount')"
          class="mt-2"
        >
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('est_receiving_amount_note Tooltip')"
          />
          <span v-if="total.gt(0)" class="font-mono flex items-center">
            {{ totalToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info :title="$t('fee')" class="mt-2">
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('fees_tooltip')"
          />
          <span v-if="fees.gt(0)" class="font-mono flex items-center">
            <span class="mr-1">≈</span>
            {{ feesToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <p class="mt-4 text-gray-500 text-xs">
          {{ $t('worst_price_note', { slippage: slippage.toFixed() }) }}
        </p>
      </div>
    </v-drawer>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import Drawer from '~/components/elements/drawer.vue'
import { SpotOrderSide, Icon, UiSpotMarket } from '~/types'
import {
  DEFAULT_MAX_SLIPPAGE,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    'v-drawer': Drawer
  },

  props: {
    orderTypeBuy: {
      required: true,
      type: Boolean
    },

    orderType: {
      required: true,
      type: String as PropType<SpotOrderSide>
    },

    total: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    totalWithFees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    totalWithoutFees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    feeReturned: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    fees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    price: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    amount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    detailsDrawerOpen: {
      required: true,
      type: Boolean
    }
  },

  data() {
    return {
      Icon
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    slippage(): BigNumberInBase {
      return new BigNumberInBase(DEFAULT_MAX_SLIPPAGE)
    },

    extractedTotal(): BigNumberInBase {
      const { totalWithFees, amount, orderTypeBuy } = this

      if (orderTypeBuy) {
        return totalWithFees
      }

      if (amount.isNaN()) {
        return ZERO_IN_BASE
      }

      return amount
    },

    extractedTotalToFormat(): string {
      const { extractedTotal, orderTypeBuy, market } = this

      if (!market) {
        return extractedTotal.toFormat(
          orderTypeBuy
            ? UI_DEFAULT_PRICE_DISPLAY_DECIMALS
            : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        )
      }

      return extractedTotal.toFormat(
        orderTypeBuy ? market.priceDecimals : market.quantityDecimals
      )
    },

    totalToFormat(): string {
      const { total, market } = this

      if (!market) {
        return total.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return total.toFormat(market.priceDecimals)
    },

    feesToFormat(): string {
      const { fees, market } = this

      if (!market) {
        return fees.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return fees.toFormat(market.priceDecimals)
    },

    amountToFormat(): string {
      const { amount, orderTypeBuy, market } = this

      if (amount.isNaN()) {
        return ZERO_IN_BASE.toFormat(
          orderTypeBuy
            ? UI_DEFAULT_PRICE_DISPLAY_DECIMALS
            : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        )
      }

      if (!market) {
        return amount.toFormat(
          orderTypeBuy
            ? UI_DEFAULT_PRICE_DISPLAY_DECIMALS
            : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        )
      }

      return amount.toFormat(
        orderTypeBuy ? market.priceDecimals : market.quantityDecimals
      )
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('drawer-toggle')
    }
  }
})
</script>
