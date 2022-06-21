<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <VDrawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <div class="mt-4">
        <TextInfo :title="$t('trade.price')" class="mt-2">
          <span
            v-if="executionPrice.gt(0)"
            class="font-mono flex items-start break-all"
          >
            {{ priceToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo
          :title="
            postOnly ? $t('trade.maker_rate') : $t('trade.maker_taker_rate')
          "
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="
              postOnly
                ? $t('trade.maker_rate_note')
                : $t('trade.maker_taker_rate_note')
            "
          />
          <span class="font-mono flex items-center">
            {{
              postOnly
                ? `${makerFeeRateToFormat}%`
                : `${makerFeeRateToFormat}%/${takerFeeRateToFormat}%`
            }}
          </span>
        </TextInfo>

        <TextInfo v-if="!postOnly" :title="$t('trade.fee')" class="mt-2">
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
            {{ totalEstimatedFees }}
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
            {{ expectedPointsToFormat }}
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
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  ZERO_IN_BASE,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'
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

    fees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    executionPrice: {
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

    postOnly: {
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

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    totalWithoutFees(): BigNumberInBase {
      const { fees, total, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return total.minus(fees)
    },

    feeReturned(): BigNumberInBase {
      const { total, takerFeeRate, makerFeeRate, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return total.times(
        new BigNumberInBase(takerFeeRate).minus(makerFeeRate.abs())
      )
    },

    feeRebates(): BigNumberInBase {
      const { total, makerFeeRate, market } = this

      if (total.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(total.times(makerFeeRate).abs()).times(
        0.6 /* Only 60% of the fees are getting returned */
      )
    },

    hubUrl(): string {
      return 'https://hub.injective.network/bridge'
    },

    makerExpectedPts(): BigNumberInBase {
      const { market, makerFeeRate, tradingRewardsCampaign, fees } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (makerFeeRate.lte(0)) {
        return ZERO_IN_BASE
      }

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
        return ZERO_IN_BASE
      }

      const disqualified =
        tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
          (marketId) => marketId === market.marketId
        )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded =
        tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
          (denom) => denom === market.quoteDenom
        )

      if (!denomIncluded) {
        return ZERO_IN_BASE
      }

      const boostedList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.boostedSpotMarketIdsList
        : []
      const multipliersList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.spotMarketMultipliersList
        : []

      const boosted = boostedList.findIndex(
        (spotMarketId) => spotMarketId === market.marketId
      )
      const boostedMultiplier =
        boosted >= 0
          ? cosmosSdkDecToBigNumber(
              multipliersList[boosted]
                ? multipliersList[boosted].makerPointsMultiplier
                : 1
            )
          : 1

      return new BigNumberInBase(fees).times(boostedMultiplier)
    },

    takerExpectedPts(): BigNumberInBase {
      const { market, tradingRewardsCampaign, fees } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
        return ZERO_IN_BASE
      }

      const disqualified =
        tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
          (marketId) => marketId === market.marketId
        )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded =
        tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
          (denom) => denom === market.quoteDenom
        )

      if (!denomIncluded) {
        return ZERO_IN_BASE
      }

      const boostedList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.boostedSpotMarketIdsList
        : []
      const multipliersList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.spotMarketMultipliersList
        : []

      const boosted = boostedList.findIndex(
        (spotMarketId) => spotMarketId === market.marketId
      )
      const boostedMultiplier =
        boosted >= 0
          ? cosmosSdkDecToBigNumber(
              multipliersList[boosted]
                ? multipliersList[boosted].takerPointsMultiplier
                : 1
            )
          : 1

      return new BigNumberInBase(fees).times(boostedMultiplier)
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

    totalEstimatedFees(): string {
      const { executionPrice, amount, feeRate, market } = this

      const fees = executionPrice.times(amount).times(feeRate)

      if (!market) {
        return fees.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return fees.toFormat(market.priceDecimals)
    },

    priceToFormat(): string {
      const { executionPrice, market } = this

      if (!market) {
        return executionPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return executionPrice.toFormat(market.priceDecimals)
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

    expectedPointsToFormat(): string {
      const { takerExpectedPtsToFormat, makerExpectedPtsToFormat, postOnly } =
        this

      if (postOnly) {
        return makerExpectedPtsToFormat
      }

      return takerExpectedPtsToFormat
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

    minimumReceivedAmountToFormat(): string {
      const {
        amount,
        market,
        executionPrice,
        orderTypeBuy,
        quoteAmount,
        feeRate
      } = this

      if (quoteAmount.isNaN()) {
        return ZERO_IN_BASE.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      if (!market) {
        return amount.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      const quantity = orderTypeBuy ? quoteAmount : amount

      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)

      if (orderTypeBuy) {
        return quantity
          .div(executionPrice.times(feeMultiplier))
          .toFormat(market.priceDecimals)
      }

      return quantity
        .times(executionPrice)
        .times(feeMultiplier)
        .toFormat(market.priceDecimals)
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('drawer-toggle')
    }
  }
})
</script>
