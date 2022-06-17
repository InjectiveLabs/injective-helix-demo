<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <VDrawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <div class="mt-4">
        <TextInfo :title="$t('trade.averagePrice')" class="mt-2">
          <span
            v-if="!averagePrice.isNaN()"
            class="font-mono flex items-start break-all"
          >
            {{ averagePriceToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo class="mt-2" :title="$t('trade.min_received_amount')">
          <span
            v-if="!amount.isNaN()"
            class="font-mono flex items-start break-all"
          >
            {{ minimumReceivedAmountToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.baseToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
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
          <span v-if="total.gt(0)" class="font-mono flex items-start break-all">
            {{ totalToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo :title="$t('trade.taker_rate')" class="mt-2">
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.taker_rate_note')"
          />
          <span class="font-mono flex items-center">
            {{ `${takerFeeRateToFormat}%` }}
          </span>
        </TextInfo>

        <TextInfo :title="$t('trade.fee')" class="mt-2">
          <div slot="context">
            <div class="flex items-center">
              <IconInfoTooltip
                slot="context"
                class="ml-2"
                :tooltip="$t('trade.fees_tooltip')"
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
            <span class="mr-1">≈</span>
            {{ totalEstimatedFees }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <!-- <TextInfo
          v-if="takerExpectedPts.gte(0)"
          :title="$t('trade.expected_points')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.expected_points_note')"
          />
          <span class="font-mono flex items-start break-all">
            {{ `${takerExpectedPtsToFormat}` }}
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
  ZERO_IN_BASE,
  UiSpotMarketWithToken,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import Drawer from '~/components/elements/drawer.vue'
import { Icon } from '~/types'
import {
  DEFAULT_MAX_SLIPPAGE,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getDecimalsFromNumber } from '~/app/utils/helpers'

export default Vue.extend({
  components: {
    VDrawer: Drawer
  },

  props: {
    averagePrice: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

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
    },

    quoteAmount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    feeRate: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    executionPrice: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    slippage: {
      required: true,
      type: Object as PropType<BigNumberInBase>
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

    marketHasNegativeMakerFee(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return new BigNumberInBase(market.makerFeeRate).lt(0)
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

    averagePriceToFormat(): string {
      const { averagePrice, market } = this

      if (!market) {
        return averagePrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return averagePrice.toFormat(market.priceDecimals)
    },

    totalToFormat(): string {
      const { total, market } = this

      if (!market) {
        return total.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return total.toFormat(market.priceDecimals)
    },

    totalEstimatedFees(): string {
      const { price, amount, feeRate, market } = this

      const fees = price.times(amount).times(feeRate)

      if (!market) {
        return fees.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return fees.toFormat(market.priceDecimals)
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

    minimumReceivedAmountToFormat(): string {
      const {
        amount,
        market,
        orderTypeBuy,
        quoteAmount,
        feeRate,
        executionPrice,
        slippage
      } = this

      if (!market) {
        return amount.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      if (quoteAmount.isNaN()) {
        return ZERO_IN_BASE.toFormat(market.quantityDecimals)
      }

      const quantity = orderTypeBuy ? quoteAmount : amount

      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)

      if (orderTypeBuy) {
        return quoteAmount
          .div(executionPrice.times(feeMultiplier).times(slippage))
          .toFormat(market.quantityDecimals)
      }

      return quantity
        .times(executionPrice)
        .times(feeMultiplier)
        .times(slippage)
        .toFormat(market.priceDecimals)
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
