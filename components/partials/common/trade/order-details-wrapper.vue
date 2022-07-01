<template>
  <component
    :is="orderDetailsComponent"
    v-bind="{
      amount,
      detailsDrawerOpen,
      executionPrice,
      executionPriceToFormat,
      expectedPointsToFormat,
      makerExpectedPts,
      takerExpectedPts,
      feeRebates,
      feeRebatesToFormat,
      feeReturned,
      fees,
      feesToFormat,
      liquidationPrice,
      makerFeeRate,
      makerFeeRateDiscount,
      makerFeeRateDiscount,
      makerFeeRateToFormat,
      marketHasNegativeMakerFee,
      minimumReceivedAmount,
      notionalValue,
      notionalWithLeverage,
      notionalWithLeverageAndFees,
      orderTypeBuy,
      orderTypeReduceOnly,
      postOnly,
      takerFeeRate,
      takerFeeRateDiscount,
      takerFeeRateDiscount,
      takerFeeRateToFormat,
      totalEstimatedFees
    }"
    @set:drawer-toggle="onDetailsDrawerToggle"
  />
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  cosmosSdkDecToBigNumber,
  PointsMultiplier
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import OrderDetailsSpot from '~/components/partials/spot/trading/order-details.vue'
import OrderDetailsMarketSpot from '~/components/partials/spot/trading/order-details-market.vue'
import OrderDetailsDerivatives from '~/components/partials/derivatives/trading/order-details.vue'
import OrderDetailsMarketDerivatives from '~/components/partials/derivatives/trading/order-details-market.vue'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { getDecimalsFromNumber } from '~/app/utils/helpers'

export default Vue.extend({
  components: {
    OrderDetailsSpot,
    OrderDetailsMarketSpot,
    OrderDetailsDerivatives,
    OrderDetailsMarketDerivatives
  },

  props: {
    market: {
      type: Object as PropType<
        UiSpotMarketWithToken | UiDerivativeMarketWithToken
      >,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    orderType: {
      type: String as PropType<SpotOrderSide>,
      required: true
    },

    notionalValue: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    notionalValueWithFees: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    notionalWithLeverage: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    notionalWithLeverageAndFees: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    takerFeeRateDiscount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    makerFeeRateDiscount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    takerFeeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    makerFeeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    fees: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    amount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    postOnly: {
      type: Boolean,
      required: true
    },

    quoteAmount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    feeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    slippage: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    liquidationPrice: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    orderTypeReduceOnly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      detailsDrawerOpen: true
    }
  },

  computed: {
    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    isSpot(): boolean {
      return this.$route.name === 'spot-spot'
    },

    orderDetailsComponent(): string {
      const { tradingTypeMarket, isSpot } = this

      if (tradingTypeMarket) {
        return isSpot
          ? 'OrderDetailsMarketSpot'
          : 'OrderDetailsMarketDerivatives'
      }

      return isSpot ? 'OrderDetailsSpot' : 'OrderDetailsDerivatives'
    },

    feeReturned(): BigNumberInBase {
      const {
        isSpot,
        notionalValue,
        notionalWithLeverage,
        takerFeeRate,
        makerFeeRate,
        market
      } = this

      const total = isSpot ? notionalValue : notionalWithLeverage

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return total.times(
        new BigNumberInBase(takerFeeRate).minus(makerFeeRate.abs())
      )
    },

    feeRebates(): BigNumberInBase {
      const {
        isSpot,
        notionalValue,
        notionalWithLeverage,
        makerFeeRate,
        market
      } = this

      const total = isSpot ? notionalValue : notionalWithLeverage

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

    boostedList(): string[] {
      const { isSpot, tradingRewardsCampaign } = this

      if (
        !tradingRewardsCampaign ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo
      ) {
        return []
      }

      const boostInfo =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo

      const spotBoostedList = boostInfo
        ? boostInfo.boostedSpotMarketIdsList
        : []

      const derivativesBoostedList = boostInfo
        ? boostInfo.boostedDerivativeMarketIdsList
        : []

      return isSpot ? spotBoostedList : derivativesBoostedList
    },

    multipliersList(): PointsMultiplier[] {
      const { isSpot, tradingRewardsCampaign } = this

      if (
        !tradingRewardsCampaign ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo
      ) {
        return []
      }

      const boostInfo =
        tradingRewardsCampaign.tradingRewardCampaignInfo.tradingRewardBoostInfo

      const spotMultipliersList = boostInfo
        ? boostInfo.spotMarketMultipliersList
        : []

      const derivativesMultipliersList = boostInfo
        ? boostInfo.derivativeMarketMultipliersList
        : []

      return isSpot ? spotMultipliersList : derivativesMultipliersList
    },

    isMarketDisqualified(): boolean {
      const { market, tradingRewardsCampaign } = this

      if (
        !market ||
        !tradingRewardsCampaign ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo
          .disqualifiedMarketIdsList
      ) {
        return false
      }

      return tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.includes(
        market.marketId
      )
    },

    marketDenomIncludedInTradingReward(): boolean {
      const { market, tradingRewardsCampaign } = this

      if (
        !market ||
        !tradingRewardsCampaign ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList
      ) {
        return false
      }

      return tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.includes(
        market.quoteDenom
      )
    },

    multiplierList(): PointsMultiplier | undefined {
      const {
        boostedList,
        marketDenomIncludedInTradingReward,
        isMarketDisqualified,
        market,
        makerFeeRate,
        multipliersList
      } = this

      if (
        !market ||
        makerFeeRate.lte(0) ||
        isMarketDisqualified ||
        !marketDenomIncludedInTradingReward
      ) {
        return undefined
      }

      const boostedIndex = boostedList.findIndex(
        (marketId) => marketId === market.marketId
      )

      if (boostedIndex < 0) {
        return undefined
      }

      return multipliersList[boostedIndex]
    },

    makerExpectedPts(): BigNumberInBase {
      const { multiplierList, fees } = this

      if (!multiplierList) {
        return ZERO_IN_BASE
      }

      const boostedMultiplier = cosmosSdkDecToBigNumber(
        multiplierList.makerPointsMultiplier
          ? multiplierList.makerPointsMultiplier
          : 1
      )

      return new BigNumberInBase(fees).times(boostedMultiplier)
    },

    takerExpectedPts(): BigNumberInBase {
      const { multiplierList, fees } = this

      if (!multiplierList) {
        return ZERO_IN_BASE
      }

      const boostedMultiplier = cosmosSdkDecToBigNumber(
        multiplierList.takerPointsMultiplier
          ? multiplierList.takerPointsMultiplier
          : 1
      )

      return new BigNumberInBase(fees).times(boostedMultiplier)
    },

    totalEstimatedFees(): string {
      const { executionPrice, amount, feeRate, market } = this

      const fees = executionPrice.times(amount).times(feeRate)

      const decimal = market
        ? market.priceDecimals
        : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      return fees.toFormat(decimal, BigNumberInBase.ROUND_DOWN)
    },

    executionPriceToFormat(): string {
      const { executionPrice, market } = this

      const decimal = market
        ? market.priceDecimals
        : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      return executionPrice.toFormat(decimal, BigNumberInBase.ROUND_HALF_UP)
    },

    feesToFormat(): string {
      const { fees } = this

      return fees.toFormat(
        getDecimalsFromNumber(fees.toNumber()),
        BigNumberInBase.ROUND_DOWN
      )
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
      const { tradingTypeMarket, makerExpectedPts } = this

      const makerExpectedPtsBasedOnTradingType = tradingTypeMarket
        ? makerExpectedPts
        : makerExpectedPts.abs()

      return makerExpectedPtsBasedOnTradingType.toFormat(
        getDecimalsFromNumber(makerExpectedPtsBasedOnTradingType.toNumber())
      )
    },

    takerExpectedPtsToFormat(): string {
      const { takerExpectedPts } = this

      return takerExpectedPts.toFormat(
        getDecimalsFromNumber(takerExpectedPts.toNumber())
      )
    },

    expectedPointsToFormat(): string {
      const {
        tradingTypeMarket,
        takerExpectedPtsToFormat,
        makerExpectedPtsToFormat,
        postOnly
      } = this

      if (!tradingTypeMarket && postOnly) {
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

    minimumReceivedAmount(): BigNumberInBase {
      const {
        tradingTypeMarket,
        amount,
        market,
        executionPrice,
        orderTypeBuy,
        quoteAmount,
        feeRate,
        slippage
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)

      if (orderTypeBuy) {
        const minimumReceivedBaseAmount = quoteAmount.div(
          executionPrice.times(feeMultiplier)
        )

        return tradingTypeMarket
          ? minimumReceivedBaseAmount.div(slippage)
          : minimumReceivedBaseAmount
      }

      const minimumReceivedQuoteAmount = amount
        .times(executionPrice)
        .times(feeMultiplier)

      return tradingTypeMarket
        ? minimumReceivedQuoteAmount.times(slippage)
        : minimumReceivedQuoteAmount
    }
  },

  methods: {
    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    }
  }
})
</script>
