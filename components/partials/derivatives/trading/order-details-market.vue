<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <v-drawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between">
        <v-text-info :title="$t('total')" lg>
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('market_total_tooltip')"
          />
          <span class="font-mono flex items-center">
            <span class="mr-1">≈</span>
            {{ totalWithFeesToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
        </v-text-info>
      </p>

      <div class="mt-4">
        <v-text-info :title="$t('amount')">
          <span v-if="!amount.isNaN()" class="font-mono flex items-center">
            {{ amountToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.baseToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info
          v-if="!orderTypeReduceOnly"
          :title="$t('liquidation_price')"
          class="mt-2"
        >
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('liquidation_price_tooltip')"
          />
          <span
            v-if="liquidationPrice.gt(0)"
            class="font-mono flex items-center"
          >
            {{ liquidationPriceToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info
          v-if="!orderTypeReduceOnly"
          :title="$t('margin')"
          class="mt-2"
        >
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('margin_tooltip')"
          />
          <span v-if="margin.gt(0)" class="font-mono flex items-center">
            {{ marginToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info :title="$t('taker_rate')" class="mt-2">
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('taker_rate_note')"
          />
          <span class="font-mono flex items-center">
            {{ `${takerFeeRateToFormat}%` }}
          </span>
        </v-text-info>

        <v-text-info :title="$t('fee')" class="mt-2">
          <div slot="context">
            <div class="flex items-center">
              <v-icon-info-tooltip
                slot="context"
                class="ml-2"
                :tooltip="$t('fees_tooltip')"
              />
              <v-icon-check-tooltip
                v-if="
                  !marketHasNegativeMakerFee &&
                  (makerFeeRateDiscount.gt(0) || takerFeeRateDiscount.gt(0))
                "
                class="ml-2 text-primary-500"
                :tooltip="
                  $t('fees_tooltip_discount', {
                    maker: makerFeeRateDiscount.times(100).toFixed(),
                    taker: takerFeeRateDiscount.times(100).toFixed()
                  })
                "
              />
            </div>
          </div>
          <span v-if="fees.gt(0)" class="font-mono flex items-center">
            <span class="mr-1">≈</span>
            {{ feesToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info
          v-if="takerExpectedPts.gte(0)"
          :title="$t('expected_points')"
          class="mt-2"
        >
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('expected_points_note')"
          />
          <span class="font-mono flex items-center">
            {{ `${takerExpectedPtsToFormat}` }}
            <span class="text-gray-500 ml-1">
              {{ $t('pts') }}
            </span>
          </span>
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
import { DerivativeOrderSide, UiDerivativeMarket } from '~/types'
import {
  DEFAULT_MAX_SLIPPAGE,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getDecimalsFromNumber } from '~/app/utils/helpers'

export default Vue.extend({
  components: {
    'v-drawer': Drawer
  },

  props: {
    orderType: {
      required: true,
      type: String as PropType<DerivativeOrderSide>
    },

    total: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    totalWithFees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    liquidationPrice: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    takerFeeRateDiscount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    makerFeeRateDiscount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    takerFeeRate: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    makerFeeRate: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    takerExpectedPts: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    makerExpectedPts: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    margin: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    fees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    feeReturned: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    notionalValue: {
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

    orderTypeReduceOnly: {
      required: true,
      type: Boolean
    },

    detailsDrawerOpen: {
      required: true,
      type: Boolean
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    slippage(): BigNumberInBase {
      return new BigNumberInBase(DEFAULT_MAX_SLIPPAGE)
    },

    marketHasNegativeMakerFee(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return new BigNumberInBase(market.makerFeeRate).lt(0)
    },

    totalWithFeesToFormat(): string {
      const { totalWithFees, market } = this

      if (!market) {
        return totalWithFees.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return totalWithFees.toFormat(market.priceDecimals)
    },

    liquidationPriceToFormat(): string {
      const { liquidationPrice, market } = this

      if (!market) {
        return liquidationPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return liquidationPrice.toFormat(market.priceDecimals)
    },

    marginToFormat(): string {
      const { margin, market } = this

      if (!market) {
        return margin.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return margin.toFormat(market.priceDecimals)
    },

    feesToFormat(): string {
      const { fees } = this

      return fees.toFormat(getDecimalsFromNumber(fees.toNumber()))
    },

    makerFeeRateToFormat(): string {
      const { makerFeeRate } = this

      const number = makerFeeRate.times(100)

      return number.toFormat(getDecimalsFromNumber(number.toNumber()))
    },

    takerFeeRateToFormat(): string {
      const { takerFeeRate } = this

      const number = takerFeeRate.times(100)

      return number.toFormat(getDecimalsFromNumber(number.toNumber()))
    },

    makerExpectedPtsToFormat(): string {
      const { makerExpectedPts } = this

      return makerExpectedPts.toFormat(
        getDecimalsFromNumber(makerExpectedPts.toNumber())
      )
    },

    takerExpectedPtsToFormat(): string {
      const { takerExpectedPts } = this

      return takerExpectedPts.toFormat(
        getDecimalsFromNumber(takerExpectedPts.toNumber())
      )
    },

    amountToFormat(): string {
      const { amount, market } = this

      if (!market) {
        return amount.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      return amount.toFormat(market.quantityDecimals)
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('drawer-toggle')
    }
  }
})
</script>
