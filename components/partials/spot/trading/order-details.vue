<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <VDrawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between text-sm">
        <TextInfo :title="$t('trade.total')" lg>
          <span class="font-mono flex items-start break-all">
            <span class="mr-1">≈</span>
            {{ extractedTotalToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
        </TextInfo>
      </p>

      <div class="mt-4">
        <TextInfo :title="$t('trade.amount')">
          <span
            v-if="!amount.isNaN()"
            class="font-mono flex items-start break-all"
          >
            {{ amountToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.baseToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo :title="$t('trade.price')" class="mt-2">
          <span v-if="price.gt(0)" class="font-mono flex items-start break-all">
            {{ priceToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo :title="$t('trade.maker_taker_rate')" class="mt-2">
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.maker_taker_rate_note')"
          />
          <span class="font-mono flex items-center">
            {{ `${makerFeeRateToFormat}%/${takerFeeRateToFormat}%` }}
          </span>
        </TextInfo>

        <TextInfo
          v-if="!orderTypeBuy"
          :title="$t('trade.est_receiving_amount')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.est_receiving_amount_note')"
          />
          <span
            v-if="totalWithoutFees.gt(0)"
            class="font-mono flex items-center"
          >
            {{ totalWithoutFeesToFormat }}
            <span class="text-gray-500 ml-1">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo :title="$t('trade.fee')" class="mt-2">
          <div slot="context">
            <div class="flex items-start">
              <IconInfoTooltip
                v-if="!orderTypeBuy"
                class="ml-2"
                :tooltip="
                  marketHasNegativeMakerFee
                    ? $t('trade.fee_order_details_note_negative_margin')
                    : $t('trade.fee_order_details_note', {
                        feeReturned: feeReturned.toFixed()
                      })
                "
              />
              <IconInfoTooltip
                v-else
                class="ml-2"
                :tooltip="
                  marketHasNegativeMakerFee
                    ? $t('trade.fee_order_details_note_negative_margin')
                    : $t('trade.fees_tooltip')
                "
              />
              <IconCheckTooltip
                v-if="
                  !marketHasNegativeMakerFee &&
                  (makerFeeRateDiscount.gt(0) || takerFeeRateDiscount.gt(0))
                "
                class="ml-2 text-primary-500"
                :tooltip="
                  $t('trade.fees_tooltip_discount', {
                    maker: makerFeeRateDiscount.times(100).toFixed(),
                    taker: takerFeeRateDiscount.times(100).toFixed()
                  })
                "
              />
            </div>
          </div>

          <span v-if="fees.gt(0)" class="font-mono flex items-start break-all">
            {{ feesToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo
          v-if="marketHasNegativeMakerFee"
          :title="$t('trade.est_fee_rebate')"
          class="mt-2"
        >
          <div slot="context">
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.est_fee_rebate_note')"
            />
          </div>
          <span
            v-if="feeRebates.gt(0)"
            class="font-mono flex items-start break-all"
          >
            {{ feeRebatesToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <!-- <TextInfo
          v-if="makerExpectedPts.gte(0) || takerExpectedPts.gte(0)"
          :title="$t('trade.expected_points')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.expected_points_note')"
          />
          <span class="font-mono flex items-start break-all">
            {{ `${makerExpectedPtsToFormat}/${takerExpectedPtsToFormat}` }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ $t('pts') }}
            </span>
          </span>
        </TextInfo> -->
      </div>
    </VDrawer>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  ZERO_IN_BASE,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import Drawer from '~/components/elements/drawer.vue'
import { Icon } from '~/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { getDecimalsFromNumber } from '~/app/utils/helpers'

export default Vue.extend({
  components: {
    VDrawer: Drawer
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

    feeRebates: {
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
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    extractedTotal(): BigNumberInBase {
      const { totalWithFees, amount } = this

      if (amount.isNaN()) {
        return ZERO_IN_BASE
      }

      return totalWithFees
    },

    extractedTotalToFormat(): string {
      const { extractedTotal, market } = this

      if (!market) {
        return extractedTotal.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return extractedTotal.toFormat(market.priceDecimals)
    },

    totalWithoutFeesToFormat(): string {
      const { totalWithoutFees, market } = this

      if (!market) {
        return totalWithoutFees.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return totalWithoutFees.toFormat(market.priceDecimals)
    },

    priceToFormat(): string {
      const { price, market } = this

      if (!market) {
        return price.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return price.toFormat(market.priceDecimals)
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

      return makerExpectedPts
        .abs()
        .toFormat(getDecimalsFromNumber(makerExpectedPts.toNumber()))
    },

    takerExpectedPtsToFormat(): string {
      const { takerExpectedPts } = this

      return takerExpectedPts.toFormat(
        getDecimalsFromNumber(takerExpectedPts.toNumber())
      )
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

    amountToFormat(): string {
      const { amount, market } = this

      if (amount.isNaN()) {
        return ZERO_IN_BASE.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      if (!market) {
        return amount.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return amount.toFormat(market.priceDecimals)
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('drawer-toggle')
    }
  }
})
</script>
