<template>
  <div class="bg-gray-800 rounded-xl py-4">
    <div class="px-4 w-full">
      <div class="flex items-center justify-center">
        <v-button
          class="text-center rounded-3xl focus:outline-none px-2 py-1 text-xs font-bold tracking-wide text-primary-500 hover:text-primary-600"
          :class="{ 'text-gray-500': !tradingTypeMarket }"
          @click.stop="onTradingTypeToggle(TradeExecutionType.Market)"
        >
          {{ $t('trade.market') }}
        </v-button>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button
          class="text-center rounded-3xl focus:outline-none px-2 py-1 text-xs font-bold tracking-wide text-primary-500 hover:text-primary-600"
          :class="{ 'text-gray-500': tradingTypeMarket }"
          @click.stop="onTradingTypeToggle(TradeExecutionType.LimitFill)"
        >
          {{ $t('trade.limit') }}
        </v-button>
      </div>
      <div class="mt-4">
        <div class="bg-gray-950 pt-2 rounded-lg">
          <div class="flex justify-between items-center mb-2 px-3">
            <span class="text-2xs md:text-xs font-semibold uppercase tracking-wider text-gray-500 mt-auto text-center">
              {{ $t('trade.swap.from') }}
            </span>
            <v-balance
              v-if="market"
              :balance="orderTypeBuy ? quoteAvailableBalance : baseAvailableBalance"
              :market="market"
            />
          </div>
          <v-token-selector
            class="input-swap"
            :amount="orderTypeBuy ? buyAmount : form.amount"
            :balance="orderTypeBuy ? quoteAvailableBalance : baseAvailableBalance"
            :value="fromToken"
            :tokens="fromTokens"
            :placeholder="'Select a token'"
            @input:amount="onSetAmount"
            @input:token="onSetFromToken"
            @input:max="onMaxInput"
          />
        </div>
        <div class="my-4 flex justify-between items-center">
          <div v-if="!tradingTypeMarket" class="w-full -mt-2">
            <v-input
              ref="input-price"
              v-model="form.price"
              :placeholder="priceStep"
              :disabled="tradingTypeMarket"
              type="number"
              :step="priceStep"
              :max-decimals="market ? market.quoteToken.decimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS"
              :max-selector="true"
              :max-label="'trade.swap.currentRate'"
              min="0"
              @blur="onPriceBlur"
              @input="onPriceChange"
              @input-max="setRateToLastTradePrice"
            >
              <template slot="addon">
                <span class="text-2xs md:text-xs font-semibold uppercase tracking-wider text-gray-500">{{ $t('trade.swap.rate') }}</span>
              </template>
            </v-input>
          </div>
          <button
            type="button"
            class="rounded-lg z-10 flex items-center justify-center border-4 min-w-[48px] w-12 h-12 bg-gray-700 border-gray-900 relative before:w-0 before:border-l before:border-dashed before:border-gray-600 before:h-[16px] before:absolute before:left-[50%] before:bottom-[calc(100%+4px)] after:w-0 after:border-l after:border-dashed after:border-gray-600 after:h-[16px] after:absolute after:left-[50%] after:top-[calc(100%+4px)]"
            :class="tradingTypeMarket ? 'mx-auto' : 'mx-6'"
            @click="switchTokens"
          >
            <v-icon-arrow-left-right class="transform w-4 h-4 -rotate-90" />
          </button>
        </div>
        <div class="bg-gray-950 pt-2 rounded-lg mb-4">
          <div class="flex justify-between items-center mb-2 px-3">
            <span class="text-2xs md:text-xs font-semibold uppercase tracking-wider text-gray-500 mt-auto text-center">
              {{ $t('trade.swap.to') }}
            </span>
            <v-balance
              v-if="market"
              :balance="orderTypeBuy ? baseAvailableBalance : quoteAvailableBalance"
              :market="market"
            />
          </div>
          <v-token-selector
            class="input-swap"
            :amount="form.toAmount"
            :balance="orderTypeBuy ? baseAvailableBalance : quoteAvailableBalance"
            :value="toToken"
            :tokens="toTokens"
            :placeholder="'Select a token'"
            :validation-rules="'positiveNumber'"
            :max-selector="false"
            @input:amount="onSetToAmount"
            @input:token="onSetToToken"
          />
        </div>
        <div v-if="market">
          <span v-if="amountError" class="text-2xs font-semibold text-red-500">
            {{ amountError }}
          </span>
          <span
            v-if="priceError"
            class="text-2xs font-semibold text-red-500"
          >
            {{ priceError }}
          </span>
        </div>
      </div>
      <div class="my-8">
        <v-text-info :title="$t('trade.total')" lg>
          <v-icon-info-tooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.market_total_tooltip')"
          />
          <span v-if="market && fromToken" class="font-mono flex items-start break-all">
            <span class="mr-1">≈</span>
            {{ cost }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ fromToken.symbol }}
            </span>
          </span>
        </v-text-info>
      </div>
      <div>
        <p
          v-if="executionPriceHasHighDeviationWarning && !hasErrors"
          class="text-2xs text-red-200 mb-4"
        >
          {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
        </p>
        <v-button
          lg
          :status="status"
          :disabled="hasErrors || !isUserWalletConnected"
          :ghost="hasErrors"
          :primary="!hasErrors"
          class="w-full"
          @click.stop="onSubmit"
        >
          {{ $t('trade.swap.swap') }}
        </v-button>
      </div>
      <v-modal-order-confirm @confirmed="submitLimitOrder" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TradeError } from 'types/errors'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import {
  cosmosSdkDecToBigNumber,
  NUMBER_REGEX,
  ZERO_IN_BASE,
  UiPriceLevel,
  UiSpotMarketWithToken,
  UiSpotOrderbook,
  UiSubaccount,
  BankBalanceWithTokenAndBalance,
  Token
} from '@injectivelabs/ui-common'
import { SpotOrderSide } from '@injectivelabs/spot-consumer'
import VTokenSelector from './token-selector.vue'
import VBalance from './balance.vue'
import {
  DEFAULT_MAX_SLIPPAGE,
  DEFAULT_PRICE_WARNING_DEVIATION,
  DEFAULT_MARKET_PRICE_WARNING_DEVIATION,
  DEFAULT_MAX_PRICE_BAND_DIFFERENCE,
  DEFAULT_MIN_PRICE_BAND_DIFFERENCE,
  PRICE_BAND_ENABLED,
  BIGGER_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import { Modal } from '~/types'
import {
  calculateWorstExecutionPriceFromOrderbook,
  getApproxAmountForMarketOrder
} from '~/app/services/spot'
import {
  FeeDiscountAccountInfo,
  TradingRewardsCampaign
} from '~/app/services/exchange'
import { excludedPriceDeviationSlugs } from '~/app/data/market'

interface TradeForm {
  amount: string,
  toAmount: string
  price: string
}

const initialForm = (): TradeForm => ({
  amount: '',
  toAmount: '',
  price: ''
})

export default Vue.extend({
  components: {
    VModalOrderConfirm,
    VTokenSelector,
    VBalance
  },

  props: {
    setMarket: {
      type: Function,
      required: true
    }
  },

  data() {
    return {
      TradeExecutionType,
      SpotOrderSide,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      buyAmount: '',
      tradingType: TradeExecutionType.Market,
      orderType: SpotOrderSide.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm(),
      fromToken: null as Token | null,
      toToken: null as Token | null
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$store.state.spot.markets
    },

    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    orderbook(): UiSpotOrderbook | undefined {
      return this.$accessor.spot.orderbook
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    lastTradedPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    baseAvailableBalance(): BigNumberInBase {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.baseDenom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        market.baseToken.decimals
      )
    },

    quoteAvailableBalance(): BigNumberInBase {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.quoteDenom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        market.quoteToken.decimals
      )
    },

    buys(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.buys
    },

    sells(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.sells
    },

    amount(): BigNumberInBase {
      return new BigNumberInBase(this.form.amount)
    },

    hasAmount(): boolean {
      const { amount, amountStep } = this

      return !amount.isNaN() && amount.gt(0) && amount.gte(amountStep)
    },

    tradingTypeMarket(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.Market
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === SpotOrderSide.Buy
    },

    slippage(): BigNumberInBase {
      const { orderTypeBuy } = this

      return new BigNumberInBase(
        orderTypeBuy
          ? DEFAULT_MAX_SLIPPAGE.div(100).plus(1)
          : DEFAULT_MAX_SLIPPAGE.div(100).minus(1).times(-1)
      )
    },

    makerFeeRateDiscount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ZERO_IN_BASE
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      const discount = cosmosSdkDecToBigNumber(
        feeDiscountAccountInfo.accountInfo.makerDiscountRate
      )

      return new BigNumberInBase(discount)
    },

    takerFeeRateDiscount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ZERO_IN_BASE
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      const discount = cosmosSdkDecToBigNumber(
        feeDiscountAccountInfo.accountInfo.takerDiscountRate
      )

      return new BigNumberInBase(discount)
    },

    makerFeeRate(): BigNumberInBase {
      const { market, makerFeeRateDiscount } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const makerFeeRate = new BigNumberInBase(market.makerFeeRate)

      if (makerFeeRate.lte(0)) {
        return makerFeeRate
      }

      return new BigNumberInBase(market.makerFeeRate).times(
        new BigNumberInBase(1).minus(makerFeeRateDiscount)
      )
    },

    takerFeeRate(): BigNumberInBase {
      const { market, takerFeeRateDiscount } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const makerFeeRate = new BigNumberInBase(market.makerFeeRate)
      const takerFeeRate = new BigNumberInBase(market.takerFeeRate)

      if (makerFeeRate.lte(0)) {
        return takerFeeRate
      }

      return new BigNumberInBase(market.takerFeeRate).times(
        new BigNumberInBase(1).minus(takerFeeRateDiscount)
      )
    },

    price(): BigNumberInBase {
      return new BigNumberInBase(this.form.price)
    },

    executionPrice(): BigNumberInBase {
      const {
        tradingTypeMarket,
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        slippage,
        amount,
        price
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (tradingTypeMarket) {
        if (!hasAmount) {
          return ZERO_IN_BASE
        }

        const records = orderTypeBuy ? sells : buys

        const worstPrice = calculateWorstExecutionPriceFromOrderbook({
          records,
          amount,
          market
        })

        return new BigNumberInBase(
          worstPrice.times(slippage).toFixed(market.priceDecimals)
        )
      }

      if (price.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(price).toFixed(market.priceDecimals)
      )
    },

    hasPrice(): boolean {
      const { executionPrice, priceStep } = this

      return (
        !executionPrice.isNaN() &&
        executionPrice.gt(0) &&
        executionPrice.gte(priceStep)
      )
    },

    amountStep(): string {
      const { market } = this

      if (!market) {
        return '1'
      }

      const decimalsAllowed = new BigNumberInBase(market.quantityDecimals)

      if (decimalsAllowed.eq(0)) {
        return '1'
      }

      if (decimalsAllowed.eq(1)) {
        return '0.1'
      }

      if (decimalsAllowed.gt(1)) {
        return '0.' + '0'.repeat(decimalsAllowed.toNumber() - 1) + '1'
      }

      return '1'
    },

    priceStep(): string {
      const { market } = this

      if (!market) {
        return '1'
      }

      const decimalsAllowed = new BigNumberInBase(market.priceDecimals)

      if (decimalsAllowed.eq(0)) {
        return '1'
      }

      if (decimalsAllowed.eq(1)) {
        return '0.1'
      }

      if (decimalsAllowed.gt(1)) {
        return '0.' + '0'.repeat(decimalsAllowed.toNumber() - 1) + '1'
      }

      return '1'
    },

    priceHasHighDeviationWarning(): boolean {
      const {
        price,
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

      if (price.lte(0)) {
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
            ? lastTradedPrice.dividedBy(price)
            : price.dividedBy(lastTradedPrice)
        )
        .times(100)

      return deviation.gt(defaultPriceWarningDeviation)
    },

    executionPriceHasHighDeviationWarning(): boolean {
      const {
        executionPrice,
        orderTypeBuy,
        tradingTypeMarket,
        lastTradedPrice
      } = this

      if (!tradingTypeMarket) {
        return false
      }

      if (executionPrice.lte(0)) {
        return false
      }

      const deviation = new BigNumberInBase(1)
        .minus(
          orderTypeBuy
            ? lastTradedPrice.dividedBy(executionPrice)
            : executionPrice.dividedBy(lastTradedPrice)
        )
        .times(100)

      return deviation.gt(DEFAULT_MARKET_PRICE_WARNING_DEVIATION)
    },

    availableBalanceError(): TradeError | undefined {
      const {
        quoteAvailableBalance,
        baseAvailableBalance,
        totalWithFees,
        amount,
        hasAmount,
        orderTypeBuy
      } = this

      if (orderTypeBuy) {
        if (quoteAvailableBalance.lt(totalWithFees)) {
          return {
            price: this.$t('trade.not_enough_balance')
          }
        }

        return undefined
      }

      if (!hasAmount) {
        return undefined
      }

      if (baseAvailableBalance.lt(amount)) {
        return {
          amount: this.$t('trade.not_enough_balance')
        }
      }

      return undefined
    },

    notEnoughOrdersToFillFromError(): TradeError | undefined {
      const {
        tradingTypeMarket,
        orderTypeBuy,
        sells,
        buys,
        amount,
        hasAmount
      } = this

      if (!tradingTypeMarket || !hasAmount) {
        return
      }

      const orders = orderTypeBuy ? sells : buys

      if (orders.length <= 0 && amount.gt(0)) {
        return {
          amount: this.$t('trade.not_enough_fillable_orders')
        }
      }

      return undefined
    },

    amountTooBigToFillError(): TradeError | undefined {
      const {
        tradingTypeMarket,
        hasPrice,
        hasAmount,
        orderTypeBuy,
        sells,
        buys,
        amount,
        market
      } = this

      if (!tradingTypeMarket || !hasPrice || !hasAmount || !market) {
        return
      }

      const orders = orderTypeBuy ? sells : buys
      const totalAmount = orders.reduce((totalAmount, { quantity }) => {
        return totalAmount.plus(
          new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
        )
      }, ZERO_IN_BASE)

      if (totalAmount.lt(amount)) {
        return {
          amount: this.$t('trade.not_enough_fillable_orders')
        }
      }

      return undefined
    },

    priceNotValidError(): TradeError | undefined {
      const { form } = this

      if (!form.price) {
        return undefined
      }

      if (NUMBER_REGEX.test(form.price)) {
        return undefined
      }

      return {
        price: this.$t('trade.not_valid_number')
      }
    },

    amountNotValidNumberError(): TradeError | undefined {
      const { form } = this

      if (!form.amount) {
        return undefined
      }

      if (NUMBER_REGEX.test(form.amount)) {
        return undefined
      }

      return {
        amount: this.$t('trade.not_valid_number')
      }
    },

    middlePrice(): BigNumberInBase | undefined {
      const {
        tradingTypeMarket,
        market,
        sells,
        buys
      } = this

      if (tradingTypeMarket || !market) {
        return
      }

      const [sell] = sells
      const [buy] = buys
      const highestBuy = new BigNumberInWei(buy ? buy.price : 0).toBase(
        market.quoteToken.decimals - market.baseToken.decimals
      )
      const lowestSell = new BigNumberInWei(sell ? sell.price : 0).toBase(
        market.quoteToken.decimals - market.baseToken.decimals
      )
      return highestBuy.plus(lowestSell).dividedBy(2)
    },

    priceHighDeviationFromMidOrderbookPrice(): TradeError | undefined {
      const {
        tradingTypeMarket,
        hasPrice,
        hasAmount,
        market,
        sells,
        buys,
        executionPrice
      } = this

      if (tradingTypeMarket || !hasPrice || !hasAmount || !market) {
        return
      }

      const [sell] = sells
      const [buy] = buys
      const highestBuy = new BigNumberInWei(buy ? buy.price : 0).toBase(
        market.quoteToken.decimals - market.baseToken.decimals
      )
      const lowestSell = new BigNumberInWei(sell ? sell.price : 0).toBase(
        market.quoteToken.decimals - market.baseToken.decimals
      )
      const middlePrice = highestBuy.plus(lowestSell).dividedBy(2)

      if (middlePrice.lte(0)) {
        return undefined
      }

      if (!PRICE_BAND_ENABLED) {
        return undefined
      }

      const minTickPrice = new BigNumberInBase(
        new BigNumberInBase(1).shiftedBy(-market.priceDecimals)
      )
      const acceptableMax = middlePrice.times(
        DEFAULT_MAX_PRICE_BAND_DIFFERENCE.div(100)
      )
      const acceptableMin = middlePrice.times(
        new BigNumberInBase(1).minus(DEFAULT_MIN_PRICE_BAND_DIFFERENCE.div(100))
      )
      const cappedAcceptableMin = acceptableMin.gt(0)
        ? acceptableMin
        : minTickPrice

      if (
        executionPrice.lt(cappedAcceptableMin) ||
        executionPrice.gt(acceptableMax)
      ) {
        return {
          price: this.$t('trade.your_order_has_high_price_deviation')
        }
      }

      return undefined
    },

    priceError(): string | null {
      const { price } = this.errors

      return price || null
    },

    amountError(): string | null {
      const { amount } = this.errors

      return amount || null
    },

    errors(): TradeError {
      if (this.availableBalanceError) {
        return this.availableBalanceError
      }

      if (this.amountTooBigToFillError) {
        return this.amountTooBigToFillError
      }

      if (this.notEnoughOrdersToFillFromError) {
        return this.notEnoughOrdersToFillFromError
      }

      if (this.amountNotValidNumberError) {
        return this.amountNotValidNumberError
      }

      if (this.priceNotValidError) {
        return this.priceNotValidError
      }

      if (this.priceHighDeviationFromMidOrderbookPrice) {
        return this.priceHighDeviationFromMidOrderbookPrice
      }

      return { price: '', amount: '' }
    },

    hasErrors(): boolean {
      const {
        priceError,
        amountError,
        tradingTypeMarket,
        hasAmount,
        hasPrice,
        price,
        amount
      } = this

      if (priceError) {
        return true
      }

      if (amountError) {
        return true
      }

      if (!hasAmount) {
        return true
      }

      if (amount.lte(0)) {
        return true
      }

      if (!tradingTypeMarket) {
        if (price.lte(0) || !hasPrice) {
          return true
        }
      }

      if (!tradingTypeMarket && hasPrice && price.lte(0)) {
        return true
      }

      return false
    },

    total(): BigNumberInBase {
      const { amount, hasPrice, hasAmount, executionPrice, market } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return executionPrice.times(amount)
    },

    fees(): BigNumberInBase {
      const { total, takerFeeRate, market } = this

      if (total.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return total.times(takerFeeRate)
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

      const disqualified = tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
        (marketId) => marketId === market.marketId
      )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded = tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
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

      const disqualified = tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
        (marketId) => marketId === market.marketId
      )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded = tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
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

    totalWithFees(): BigNumberInBase {
      const { fees, total, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return fees.plus(total)
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

    tokens() {
      // TODO: Replace this with an easier way to get a list of all available tokens.
      return this.$store.state.spot.markets
        .map((market: UiSpotMarketWithToken) => [market.baseToken, market.quoteToken])
        .flat()
        .filter((a: Token, i: number, arr: Array<Token>) => arr.findIndex((b: Token) => (b.symbol === a.symbol)) === i)
    },

    tokensWithBalances(): BankBalanceWithTokenAndBalance[] {
      return this.tokens.map((token: Token) => {
          const balance = this.getFormattedBalance(token)
          return {
            balance,
            denom: token.denom,
            token
          }
        })
    },

    fromTokens(): BankBalanceWithTokenAndBalance[] {
      return this.tokensWithBalances
    },

    toTokens(): BankBalanceWithTokenAndBalance[] {
      const { fromToken } = this
      if (!fromToken) {
        return []
      }

      // TODO: Replace this with an easier way to get a list of available symbols.
      const allowedSymbols = this.$store.state.spot.markets
        .filter((m: UiSpotMarketWithToken) => m.baseToken.symbol === fromToken.symbol || m.quoteToken.symbol === fromToken.symbol)
        .map((m: UiSpotMarketWithToken) => [m.baseToken.symbol, m.quoteToken.symbol])
        .flat()
        .filter((a: string, i: number, arr: Array<string>) => arr.findIndex((b: string) => (b === a)) === i)

      return this.tokensWithBalances
        .filter((t: BankBalanceWithTokenAndBalance) => allowedSymbols.includes(t.token.symbol))
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

    cost(): string {
      const { orderTypeBuy } = this

      if (!orderTypeBuy) {
        return this.amountToFormat
      }
      return this.extractedTotalToFormat
    }
  },

  watch: {
    orderType() {
      const { tradingType, form, market } = this

      if (tradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(form.price)
      }
    },

    tradingType(newTradingType: TradeExecutionType) {
      const { form, market } = this

      if (newTradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(form.price)
      }
    },

    fromToken(token) {
      this.updateOrderType()
      const { toToken, market } = this

      if (!toToken || !token) {
        return
      }

      const newMarket = this.findMarket(token, toToken)
      if (newMarket && market?.slug !== newMarket.slug) {
        this.setMarket(newMarket.slug)
      }
    },

    toToken(token) {
      this.updateOrderType()
      const { fromToken, market } = this

      if (!fromToken || !token) {
        return
      }

      const newMarket = this.findMarket(fromToken, token)
      if (newMarket && market?.slug !== newMarket.slug) {
        this.setMarket(newMarket.slug)
      }
    },

    toTokens: {
      handler(tokens) {
        if (!this.fromToken || !this.toToken) {
          return
        }
        if (tokens.findIndex((tokenWithBalance: BankBalanceWithTokenAndBalance) => tokenWithBalance.token.denom === this.toToken?.denom) === -1) {
          this.toToken = null
        }
      }
    }
  },

  mounted() {
    const { from, to } = this.$route.query

    const market = this.getMarketFromRoute()
    const fromToken = from ? this.getTokenBySymbol(from) : null
    const toToken = to ? this.getTokenBySymbol(to) : null

    let orderType = SpotOrderSide.Buy
    if (market) {
      orderType = market.baseDenom === fromToken?.denom
        ? SpotOrderSide.Sell
        : SpotOrderSide.Buy
    }

    this.fromToken = fromToken
    this.toToken = toToken
    this.orderType = orderType
  },

  methods: {
    getMarketFromRoute(): UiSpotMarketWithToken | undefined {
      const { from, to } = this.$route.query
      const market = this.markets.find((m: any) => {
        const [base, quote] = m.slug.split('-')
        return (from === base || from === quote) && (to === base || to === quote)
      })
      return market
    },

    getTokenBySymbol(symbol: any): Token | null {
      const market = this.$store.state.spot.markets.find((m: UiSpotMarketWithToken) => m.baseToken.symbol.toLowerCase() === symbol || m.quoteToken.symbol.toLowerCase() === symbol)
      if (!market) {
        return null
      }
      if (market.baseToken.symbol.toLowerCase() === symbol) {
        return market.baseToken
      }
      return market.quoteToken
    },

    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onPriceChange(price: string = '') {
      this.form.price = price.toString()
    },

    onPriceBlur() {
      const { market, form, hasPrice } = this

      if (!market || !hasPrice) {
        return
      }

      this.form.price = new BigNumberInBase(form.price || 0).toFixed(
        market.priceDecimals
      )
    },

    onAmountBlur() {
      const { market, form } = this

      if (!market) {
        return
      }

      if (form.amount.trim() !== '') {
        this.form.amount = new BigNumberInBase(form.amount).toFixed(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }
    },

    onTradingTypeToggle(selectedTradingType: TradeExecutionType) {
      this.tradingType = selectedTradingType
      this.setRateToLastTradePrice()
    },

    setRateToLastTradePrice() {
      const { middlePrice } = this

      if (!middlePrice) {
        return
      }

      this.form.price = middlePrice.toString()
    },

    submitLimitOrder() {
      const { orderType, market, price, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.spot
        .submitLimitOrder({
          price,
          quantity: amount,
          orderType
        })
        .then(() => {
          this.$toast.success(this.$t('trade.swap.swap_success'))
          this.$set(this, 'form', initialForm())
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    submitMarketOrder() {
      const { orderType, market, executionPrice, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.spot
        .submitMarketOrder({
          quantity: amount,
          price: executionPrice,
          orderType
        })
        .then(() => {
          this.$toast.success(this.$t('trade.swap.swap_success'))
          this.$set(this, 'form', initialForm())
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    onSubmit() {
      const {
        hasErrors,
        tradingTypeMarket,
        priceHasHighDeviationWarning,
        isUserWalletConnected
      } = this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasErrors) {
        return this.$toast.error(this.$t('trade.error_in_form'))
      }

      if (tradingTypeMarket) {
        return this.submitMarketOrder()
      }

      if (!priceHasHighDeviationWarning) {
        return this.submitLimitOrder()
      }

      // If price has high deviation, we open a confirm modal
      return this.$accessor.modal.openModal(Modal.OrderConfirm)
    },

    onSetAmount (amount: string) {
      if (this.orderTypeBuy) {
        this.buyAmount = amount
        const amountInBase = new BigNumberInBase(amount)
        const percent = amountInBase.div(this.quoteAvailableBalance).times(100).toNumber()
        this.form.amount = this.getAmountByPercentage(percent)
        this.form.toAmount = this.getAmountByPercentage(percent)
      } else {
        this.form.amount = amount
      }
    },

    onSetToAmount(amount: string) {
      this.form.toAmount = amount
    },

    onMaxInput() {
      const maxAmount = this.getAmountByPercentage(100)
      if (this.orderType === SpotOrderSide.Sell) {
        this.form.amount = maxAmount

        if (this.tradingTypeMarket) {
          this.form.toAmount = this.total.toFormat(4, BigNumberInBase.ROUND_FLOOR)
        }
      } else {
        this.buyAmount = this.quoteAvailableBalance.toFormat(4, BigNumberInBase.ROUND_FLOOR)
        this.form.amount = maxAmount
        this.form.toAmount = maxAmount
      }
    },

    getAmountByPercentage(percentage: number): string {
      const {
        market,
        buys,
        sells,
        slippage,
        takerFeeRate,
        tradingTypeMarket,
        orderTypeBuy,
        baseAvailableBalance,
        quoteAvailableBalance,
        executionPrice
      } = this

      const percentageToNumber = new BigNumberInBase(percentage).div(100)
      const balance = orderTypeBuy
        ? quoteAvailableBalance
        : baseAvailableBalance

      if (!market) {
        return ''
      }

      if (!orderTypeBuy) {
        const totalFillableAmount = buys.reduce((totalAmount, { quantity }) => {
          return totalAmount.plus(
            new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
          )
        }, ZERO_IN_BASE)

        const totalBalance = new BigNumberInBase(balance).times(
          percentageToNumber
        )

        const amount = totalFillableAmount.gte(totalBalance)
          ? totalBalance
          : totalFillableAmount

        return amount.toFixed(
          market.quantityDecimals,
          BigNumberInBase.ROUND_FLOOR
        )
      }

      let result = ''
      if (tradingTypeMarket) {
        result = getApproxAmountForMarketOrder({
          market,
          balance,
          slippage: slippage.toNumber(),
          percent: percentageToNumber.toNumber(),
          records: orderTypeBuy ? sells : buys
        }).toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
      } else if (executionPrice.lte(0)) {
        result = ''
      } else if (balance.lte(0)) {
        result = ''
      } else {
        const fee = new BigNumberInBase(takerFeeRate)
        result = new BigNumberInBase(balance)
          .dividedBy(executionPrice.times(fee.plus(1)))
          .times(percentageToNumber)
          .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
      }

      return result
    },

    getBalance(token: Token): BigNumberInBase {
      const balances = this.subaccount?.balances
      if (!balances) {
        return new BigNumberInBase(0)
      }
      const balance = balances.find(b => b.denom === token.denom)
      if (!balance) {
        return ZERO_IN_BASE
      }
      return new BigNumberInWei(balance.availableBalance)
        .toBase(token.decimals)
    },

    getFormattedBalance(token: Token): string {
      return this.getBalance(token).toFormat(3, BigNumberInBase.ROUND_DOWN)
    },

    onSetFromToken(token: Token) {
      const { toToken } = this
      if (toToken && toToken.denom === token.denom) {
        this.switchTokens()
        return
      }

      if (toToken) {
        if (!this.isValidMarket(token, toToken)) {
          this.toToken = null
          this.fromToken = token
          return
        }
      }

      this.fromToken = token
    },

    onSetToToken(token: Token) {
      const { fromToken } = this
      if (fromToken && fromToken.denom === token.denom) {
        this.switchTokens()
        return
      }

      if (fromToken) {
        if (!this.isValidMarket(fromToken, token)) {
          this.fromToken = null
          this.toToken = token
          return
        }
      }

      this.toToken = token
    },

    switchTokens() {
      const from = this.fromToken
      this.fromToken = this.toToken
      this.toToken = from

      const fromAmount = this.buyAmount
      this.buyAmount = this.form.toAmount
      this.form.toAmount = fromAmount
    },

    updateOrderType() {
      const { fromToken, toToken } = this
      if (!fromToken || !toToken) {
        return
      }

      const market = this.findMarket(fromToken, toToken)
      if (!market) {
        return
      }

      this.orderType = market.baseDenom === fromToken.denom
        ? SpotOrderSide.Sell
        : SpotOrderSide.Buy
    },

    findMarket(fromToken: Token, toToken: Token): UiSpotMarketWithToken | undefined {
      // TODO: Replace with simpler way to check if a market exists.
      const market = this.$accessor.spot.markets.find((m: UiSpotMarketWithToken) => {
        return (m.baseToken.denom === fromToken.denom && m.quoteToken.denom === toToken.denom) ||
          (m.baseToken.denom === toToken.denom && m.quoteToken.denom === fromToken.denom)
      })

      return market
    },

    isValidMarket(fromToken: Token, toToken: Token): boolean {
      return !!this.findMarket(fromToken, toToken)
    }
  }
})
</script>
