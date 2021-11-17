<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <v-drawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between text-sm">
        <v-text-info :title="$t('total')" lg>
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

        <v-text-info :title="$t('price')" class="mt-2">
          <span v-if="price.gt(0)" class="font-mono flex items-center">
            {{ priceToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
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

        <v-text-info :title="$t('notional_value')" class="mt-2">
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('notional_value_tooltip')"
          />
          <span v-if="notionalValue.gt(0)" class="font-mono flex items-center">
            {{ notionalValueToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info :title="$t('maker_taker_rate')" class="mt-2">
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('maker_taker_rate_note')"
          />
          <span class="font-mono flex items-center">
            {{ `${makerFeeRateToFormat}%/${takerFeeRateToFormat}%` }}
          </span>
        </v-text-info>

        <v-text-info :title="$t('fee')" class="mt-2">
          <div slot="context">
            <div class="flex items-center">
              <v-icon-info-tooltip
                slot="context"
                class="ml-2"
                :tooltip="
                  marketHasNegativeMakerFee
                    ? $t('fee_order_details_note_negative_margin')
                    : $t('fee_order_details_note', {
                        feeReturned: feeReturned.toFixed()
                      })
                "
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
            {{ feesToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info
          v-if="marketHasNegativeMakerFee"
          :title="$t('est_fee_rebate')"
          class="mt-2"
        >
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('est_fee_rebate_note')"
          />
          <span v-if="feeRebates.gt(0)" class="font-mono flex items-center">
            {{ feeRebatesToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </v-text-info>

        <v-text-info
          v-if="makerExpectedPts.gte(0) || takerExpectedPts.gte(0)"
          :title="$t('expected_points')"
          class="mt-2"
        >
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('expected_points_note')"
          />
          <span class="font-mono flex items-center">
            {{ `${makerExpectedPtsToFormat}/${takerExpectedPtsToFormat}` }}
            <span class="text-gray-500 ml-1">
              {{ $t('pts') }}
            </span>
          </span>
        </v-text-info>
      </div>
    </v-drawer>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import Drawer from '~/components/elements/drawer.vue'
import { DerivativeOrderSide, UiDerivativeMarket, Icon } from '~/types'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  getDecimalsBasedOnNumber,
  getDecimalsFromNumber
} from '~/app/utils/helpers'

export default Vue.extend({
  components: {
    'v-drawer': Drawer
  },

  props: {
    orderType: {
      required: true,
      type: String as PropType<DerivativeOrderSide>
    },

    totalWithFees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    total: {
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

    feeRebates: {
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

  data() {
    return {
      Icon
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    totalWithFeesToFormat(): string {
      const { totalWithFees, market } = this

      if (!market) {
        return totalWithFees.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return totalWithFees.toFormat(market.priceDecimals)
    },

    priceToFormat(): string {
      const { price, market } = this

      if (!market) {
        return price.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return price.toFormat(market.priceDecimals)
    },

    notionalValueToFormat(): string {
      const { notionalValue, market } = this

      if (!market) {
        return notionalValue.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return notionalValue.toFormat(market.priceDecimals)
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

    marketHasNegativeMakerFee(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return new BigNumberInBase(market.makerFeeRate).lt(0)
    },

    feeRebatesToFormat(): string {
      const { feeRebates, market } = this

      if (!market) {
        return feeRebates.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return feeRebates.toFormat(market.priceDecimals)
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

      if (amount.isNaN()) {
        return ZERO_IN_BASE.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

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
