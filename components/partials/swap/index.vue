<template>
  <div class="bg-gray-800 rounded-xl py-8">
    <div class="px-8 w-full">
      <!-- <div class="flex items-center justify-center">
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
      </div> -->
      <div class="flex items-center justify-between mb-8">
        <span class="font-bold text-lg">
          {{ $t('trade.swap.swap') }}
        </span>
        <button
          id="swap-settings-dropdown-target"
          type="button"
          @click="toggleSwapSettingsModal"
        >
          <IconCogwheel
            class="cursor-pointer hover:text-primary-500"
            :class="
              swapSettingsModalActive ? 'text-primary-500' : 'text-gray-500'
            "
          />
        </button>
        <PopperBox
          ref="swap-settings-dropdown"
          class="popper rounded-lg flex flex-col flex-wrap text-xs absolute bg-gray-800 p-4 z-1110 border border-primary-500 shadow-lg w-[calc(100%-6rem)] xs:w-96"
          binding-element="#swap-settings-dropdown-target"
          :options="popperOptions"
          hide-arrow
          disable-auto-close
          @close="hideSwapSettingsModal"
        >
          <AdvancedSettings
            :warnings="slippageWarnings"
            :slippage-tolerance="form.slippageTolerance"
            @set-slippage-tolerance="setSlippageTolerance"
          />
        </PopperBox>
      </div>
      <div>
        <TokenSelector
          class="input-swap"
          :amount="form.amount"
          :balance="fromBalance"
          :balance-decimal-places="market && market.quantityDecimals"
          :value="fromToken"
          :tokens="fromTokens"
          :placeholder="'Select a token'"
          :prefix="orderTypeBuy ? '&asymp;' : null"
          :usd-price="fromUsdPrice"
          @input:amount="onSetAmount"
          @input:token="onSetFromToken"
          @input:max="onMaxInput"
        />
        <div class="flex justify-between items-center -my-2">
          <!-- <div v-if="!tradingTypeMarket" class="w-full -mt-2">
            <v-input
              ref="input-price"
              v-model="form.price"
              :placeholder="priceStep"
              :disabled="tradingTypeMarket"
              type="number"
              :step="priceStep"
              :max-decimals="market ? market.quoteToken.decimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS"
              :max-label="'trade.swap.current_rate'"
              min="0"
              @blur="onPriceBlur"
              @input="onPriceChange"
              @input-max="setRateToLastTradePrice"
            >
              <template slot="addon">
                <span class="text-2xs md:text-xs font-semibold uppercase tracking-wider text-gray-500">{{ $t('trade.swap.rate') }}</span>
              </template>
            </v-input>
          </div> -->
          <button
            type="button"
            class="rounded-full z-1000 flex items-center justify-center min-w-[32px] w-8 h-8 bg-primary-600 hover:bg-primary-500 relative mx-auto"
            @click="switchTokens"
          >
            <IconArrowDown class="transform w-[10px] h-[10px]" />
          </button>
        </div>
        <TokenSelector
          class="input-swap"
          :amount="form.toAmount"
          :balance="toBalance"
          :balance-decimal-places="market && market.quantityDecimals"
          :value="toToken"
          :tokens="toTokens"
          :placeholder="'Select a token'"
          :prefix="orderTypeBuy ? null : '≈'"
          :validation-rules="'positiveNumber'"
          disable-max-selector
          @input:amount="onSetToAmount"
          @input:token="onSetToToken"
        />
      </div>
      <SwapDetails
        v-if="fromToken && toToken"
        :pending="pricesPending"
        :from-token="fromToken"
        :to-token="toToken"
        :amount="amount"
        :market="market"
        :order-type="orderType"
        :slippage="slippage"
        :calculate-execution-price-for-amount="calculateExecutionPriceForAmount"
      />
      <div class="mt-6">
        <v-button
          v-if="isUserWalletConnected"
          lg
          :status="status"
          :disabled="swapButtonDisabled"
          :ghost="hasErrors"
          :primary="!hasErrors"
          class="w-full"
          @click.stop="onSubmit"
        >
          {{ swapButtonLabel }}
        </v-button>
        <v-button
          v-else
          lg
          :status="status"
          primary
          class="w-full"
          @click.stop="handleClickOrConnect"
        >
          {{ $t('trade.swap.connect_wallet') }}
        </v-button>
      </div>
      <span
        v-if="executionPriceHasHighDeviationWarning"
        class="block mt-4 text-2xs font-semibold text-red-200"
      >
        {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
      </span>
      <SwapErrors
        v-if="showErrors"
        :errors="errors"
        :show-portfolio-link="
          errors.linkType === SwapTradeErrorLinkType.Portfolio
        "
        :show-hub-link="errors.linkType === SwapTradeErrorLinkType.Hub"
      />
    </div>
    <ModalInsufficientInjForGas />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TradeError } from 'types/errors'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType, Wallet } from '@injectivelabs/ts-types'
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
import TokenSelector from './token-selector.vue'
import AdvancedSettings from './advanced-settings.vue'
import SwapDetails from './swap-details.vue'
import SwapErrors from './swap-errors.vue'
import PopperBox from '~/components/elements/popper-box.vue'
import {
  DEFAULT_MARKET_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  DEFAULT_MAX_SLIPPAGE
} from '~/app/utils/constants'
import ModalInsufficientInjForGas from '~/components/partials/modals/insufficient-inj-for-gas.vue'
import { Modal } from '~/types'
import { calculateWorstExecutionPriceFromOrderbook } from '~/app/services/spot'
import {
  FeeDiscountAccountInfo,
  TradingRewardsCampaign
} from '~/app/services/exchange'

interface TradeForm {
  amount: string
  toAmount: string
  price: string
  slippageTolerance: string
}

enum SwapTradeErrorLinkType {
  None = 0,
  Portfolio = 1,
  Hub = 2
}

interface SwapTradeError extends TradeError {
  linkType: SwapTradeErrorLinkType
}

const initialForm = (): TradeForm => ({
  amount: '',
  toAmount: '',
  price: '',
  slippageTolerance: '0.5'
})

export default Vue.extend({
  components: {
    ModalInsufficientInjForGas,
    TokenSelector,
    AdvancedSettings,
    SwapDetails,
    SwapErrors,
    PopperBox
  },

  data() {
    return {
      SwapTradeErrorLinkType,
      TradeExecutionType,
      SpotOrderSide,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      // buyAmount: '',
      tradingType: TradeExecutionType.Market,
      orderType: SpotOrderSide.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm(),
      fromToken: null as Token | null,
      toToken: null as Token | null,
      swapSettingsModalActive: false,
      fromUsdPrice: new BigNumberInBase(0).toFormat(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      ),
      toUsdPrice: new BigNumberInBase(0).toFormat(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      ),
      pricesPending: false
    }
  },

  computed: {
    swapButtonLabel(): string {
      const { availableBalanceError } = this

      if (availableBalanceError) {
        return this.$t('trade.swap.insufficient_balance')
      }

      return this.$t('trade.swap.swap')
    },

    swapButtonDisabled(): boolean {
      const { hasErrors, hasEnoughInjForGasOrNotKeplr } = this

      return hasErrors || !hasEnoughInjForGasOrNotKeplr
    },

    $popper(): any {
      return this.$refs['swap-settings-dropdown']
    },

    popperOptions(): any {
      return {
        placement: 'bottom-end',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      }
    },

    showErrors(): boolean | undefined {
      const {
        market,
        amountError,
        priceError,
        hasEnoughInjForGasOrNotKeplr
      } = this

      return (
        market && !!(amountError || priceError || !hasEnoughInjForGasOrNotKeplr)
      )
    },

    slippage(): BigNumberInBase {
      const { orderTypeBuy, form } = this

      const maxSlippage = DEFAULT_MAX_SLIPPAGE.times(100)

      const slippageToleranceAsNumber = new BigNumberInBase(
        form.slippageTolerance
      )

      const slippageTolerance = slippageToleranceAsNumber.lte(maxSlippage)
        ? slippageToleranceAsNumber
        : maxSlippage

      const slippage = new BigNumberInBase(
        orderTypeBuy
          ? slippageTolerance.div(100).plus(1)
          : slippageTolerance.div(100).minus(1).times(-1)
      )

      return slippage
    },

    slippageToFormat(): string {
      return this.slippage.toFormat(2)
    },

    slippageWarnings(): Array<string> {
      const slippageTolerance = new BigNumberInBase(this.form.slippageTolerance)

      const result = []

      if (slippageTolerance.gt(new BigNumberInBase(5))) {
        result.push(this.$t('trade.swap.high_slippage_warning'))
      }

      if (slippageTolerance.lt(new BigNumberInBase(0.05))) {
        result.push(this.$t('trade.swap.low_slippage_warning'))
      }

      return result
    },

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

    fromBalance(): BigNumberInBase {
      const { fromToken, subaccount } = this

      if (!subaccount || !fromToken) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === fromToken.denom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        fromToken.decimals
      )
    },

    toBalance(): BigNumberInBase {
      const { toToken, subaccount } = this

      if (!subaccount || !toToken) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) => balance.denom.toLowerCase() === toToken.denom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        toToken.decimals
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

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === SpotOrderSide.Buy
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
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        slippage,
        amount
      } = this

      if (!market || !hasAmount) {
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

    executionPriceHasHighDeviationWarning(): boolean {
      const { executionPrice, orderTypeBuy, lastTradedPrice } = this

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

    availableBalanceError(): SwapTradeError | undefined {
      const {
        quoteAvailableBalance,
        baseAvailableBalance,
        totalWithFees,
        amount,
        hasAmount,
        orderTypeBuy,
        fromToken
      } = this

      if (orderTypeBuy) {
        if (quoteAvailableBalance.lt(totalWithFees)) {
          return {
            price: this.$t('trade.swap.insufficient_balance_verbose', {
              symbol: fromToken ? fromToken.symbol : ''
            }),
            linkType: SwapTradeErrorLinkType.Portfolio
          }
        }
        return undefined
      }

      if (!hasAmount) {
        return undefined
      }

      if (baseAvailableBalance.lt(amount)) {
        return {
          amount: this.$t('trade.swap.insufficient_balance_verbose', {
            symbol: fromToken ? fromToken.symbol : ''
          }),
          linkType: SwapTradeErrorLinkType.Portfolio
        }
      }

      return undefined
    },

    notEnoughOrdersToFillFromError(): SwapTradeError | undefined {
      const { orderTypeBuy, sells, buys, amount, hasAmount } = this

      if (!hasAmount) {
        return
      }

      const orders = orderTypeBuy ? sells : buys

      if (orders.length <= 0 && amount.gt(0)) {
        return {
          amount: this.$t('trade.not_enough_fillable_orders'),
          linkType: SwapTradeErrorLinkType.None
        }
      }

      return undefined
    },

    amountTooBigToFillError(): SwapTradeError | undefined {
      const {
        hasPrice,
        hasAmount,
        orderTypeBuy,
        sells,
        buys,
        amount,
        market
      } = this

      if (!hasPrice || !hasAmount || !market) {
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
          amount: this.$t('trade.not_enough_fillable_orders'),
          linkType: SwapTradeErrorLinkType.None
        }
      }

      return undefined
    },

    priceNotValidError(): SwapTradeError | undefined {
      const { form } = this

      if (!form.price) {
        return undefined
      }

      if (NUMBER_REGEX.test(form.price)) {
        return undefined
      }

      return {
        price: this.$t('trade.not_valid_number'),
        linkType: SwapTradeErrorLinkType.None
      }
    },

    amountNotValidNumberError(): SwapTradeError | undefined {
      const { form } = this

      if (!form.amount) {
        return undefined
      }

      if (NUMBER_REGEX.test(form.amount)) {
        return undefined
      }

      return {
        amount: this.$t('trade.not_valid_number'),
        linkType: SwapTradeErrorLinkType.None
      }
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

      return { price: '', amount: '' }
    },

    hasErrors(): boolean {
      const { priceError, amountError, hasAmount, amount } = this

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

    tokens(): Token[] {
      // TODO: Replace this with an easier way to get a list of all available tokens.
      return this.$store.state.spot.markets
        .map((market: UiSpotMarketWithToken) => [
          market.baseToken,
          market.quoteToken
        ])
        .flat()
        .filter(
          (a: Token, i: number, arr: Array<Token>) =>
            arr.findIndex((b: Token) => b.symbol === a.symbol) === i
        )
    },

    tokensWithBalances(): BankBalanceWithTokenAndBalance[] {
      return this.tokens.map((token: Token) => {
        const balance = this.getFormattedBalance(token)

        return {
          balance,
          denom: token.denom,
          token
        } as BankBalanceWithTokenAndBalance
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
        .filter(
          (m: UiSpotMarketWithToken) =>
            m.baseToken.symbol === fromToken.symbol ||
            m.quoteToken.symbol === fromToken.symbol
        )
        .map((m: UiSpotMarketWithToken) => [
          m.baseToken.symbol,
          m.quoteToken.symbol
        ])
        .flat()
        .filter(
          (a: string, i: number, arr: Array<string>) =>
            arr.findIndex((b: string) => b === a) === i
        )

      return this.tokensWithBalances.filter(
        (t: BankBalanceWithTokenAndBalance) =>
          allowedSymbols.includes(t.token.symbol)
      )
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

    fee(): string {
      const {
        amount,
        executionPrice,
        takerFeeRate,
        takerFeeRateDiscount,
        market
      } = this

      const decimalPlaces = market
        ? market.priceDecimals
        : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      if (amount.isNaN()) {
        return ZERO_IN_BASE.toFormat(decimalPlaces)
      }

      const discount = new BigNumberInBase(1).minus(takerFeeRateDiscount)

      return executionPrice
        .times(amount)
        .times(takerFeeRate)
        .times(discount)
        .toFormat(decimalPlaces)
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    hasEnoughInjForGasOrNotKeplr(): boolean {
      const { wallet, hasEnoughInjForGas } = this

      if (wallet !== Wallet.Keplr) {
        return true
      }

      return hasEnoughInjForGas
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
      this.updatePrices()

      const { toToken, market } = this

      if (!toToken || !token) {
        return
      }

      const newMarket = this.findMarket(token, toToken)

      if (!newMarket) {
        this.resetToDefaultMarket()
        return
      }

      if (newMarket && market?.slug !== newMarket.slug) {
        this.$emit('set-market', newMarket.slug)
      }
    },

    toToken(token) {
      this.updateOrderType()
      this.updatePrices()

      const { fromToken, market } = this

      if (!fromToken || !token) {
        return
      }

      const newMarket = this.findMarket(fromToken, token)

      if (!newMarket) {
        this.resetToDefaultMarket()
        return
      }

      if (newMarket && market?.slug !== newMarket.slug) {
        this.$emit('set-market', newMarket.slug)
      }
    }
  },

  mounted() {
    if (!this.hasEnoughInjForGasOrNotKeplr) {
      this.$accessor.modal.openModal(Modal.InsufficientInjForGas)
    }

    let { from, to } = this.$route.query

    if (!from || !to) {
      from = 'usdt'
      to = 'inj'
    }

    if (!this.isTokenSymbolValid(from)) {
      this.$toast.error(
        this.$t('trade.swap.invalid_token_symbol_warning', {
          symbol: from.toUpperCase(),
          defaultSymbol: 'USDT'
        })
      )

      from = 'usdt'
    }

    if (!this.isTokenSymbolValid(to)) {
      this.$toast.error(
        this.$t('trade.swap.invalid_token_symbol_warning', {
          symbol: to.toUpperCase(),
          defaultSymbol: 'INJ'
        })
      )

      to = 'inj'
    }

    const market = this.getMarketFromRoute()
    const fromToken = this.getTokenBySymbol(from)
    const toToken = this.getTokenBySymbol(to)

    let orderType = SpotOrderSide.Buy

    if (market) {
      orderType =
        market.baseDenom === fromToken?.denom
          ? SpotOrderSide.Sell
          : SpotOrderSide.Buy
    }

    this.fromToken = fromToken
    this.toToken = toToken
    this.orderType = orderType
  },

  methods: {
    setSlippageTolerance(slippageTolerance: string): void {
      this.form.slippageTolerance = slippageTolerance
    },

    getMarketFromRoute(): UiSpotMarketWithToken | undefined {
      const { from, to } = this.$route.query

      const market = this.markets.find((m: any) => {
        const [base, quote] = m.slug.split('-')
        return (
          (from === base || from === quote) && (to === base || to === quote)
        )
      })

      return market
    },

    getTokenBySymbol(symbol: string): Token | null {
      const market = this.$store.state.spot.markets.find(
        (m: UiSpotMarketWithToken) =>
          m.baseToken.symbol.toLowerCase() === symbol ||
          m.quoteToken.symbol.toLowerCase() === symbol
      )

      if (!market) {
        return null
      }

      if (market.baseToken.symbol.toLowerCase() === symbol) {
        return market.baseToken
      }

      return market.quoteToken
    },

    isTokenSymbolValid(symbol: any): boolean {
      const market = this.$store.state.spot.markets.find(
        (m: UiSpotMarketWithToken) =>
          m.baseToken.symbol.toLowerCase() === symbol ||
          m.quoteToken.symbol.toLowerCase() === symbol
      )

      return !!market
    },

    onDetailsDrawerToggle(): void {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onPriceChange(price: string = ''): void {
      this.form.price = price.toString()
    },

    onPriceBlur(): void {
      const { market, form, hasPrice } = this

      if (!market || !hasPrice) {
        return
      }

      this.form.price = new BigNumberInBase(form.price || 0).toFixed(
        market.priceDecimals
      )
    },

    onAmountBlur(): void {
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

    submitLimitOrder(): void {
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

    submitMarketOrder(): void {
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

    onSubmit(): any {
      const { hasErrors, isUserWalletConnected } = this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasErrors) {
        return this.$toast.error(this.$t('trade.error_in_form'))
      }

      return this.submitMarketOrder()
    },

    onSetAmount(quantity: string): void {
      const { orderTypeBuy, market } = this

      const quantityAsNumber = new BigNumberInBase(Number(quantity))

      const executionPrice = this.calculateExecutionPriceForAmount(
        quantityAsNumber
      )

      const toQuantity = orderTypeBuy
        ? quantityAsNumber.dividedBy(executionPrice)
        : executionPrice.times(quantityAsNumber)

      this.form.amount = quantity

      this.form.toAmount = toQuantity.toFormat(
        orderTypeBuy ? market?.priceDecimals : market?.quantityDecimals
      )

      this.updatePrices()
    },

    onSetToAmount(quantity: string) {
      const { orderTypeBuy, market } = this

      const quantityAsNumber = new BigNumberInBase(Number(quantity))

      const executionPrice = this.calculateExecutionPriceForAmount(
        quantityAsNumber
      )

      const fromQuantity = orderTypeBuy
        ? executionPrice.times(quantityAsNumber)
        : quantityAsNumber.dividedBy(executionPrice)

      this.form.amount = fromQuantity.toFormat(
        orderTypeBuy ? market?.quantityDecimals : market?.priceDecimals
      )

      this.form.toAmount = quantity
      this.updatePrices()
    },

    calculateExecutionPriceForAmount(amount: BigNumberInBase): BigNumberInBase {
      const { orderTypeBuy, sells, buys, market, slippage } = this

      if (!market || !amount) {
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
    },

    onMaxInput(max: string): void {
      const { orderTypeBuy, executionPrice } = this

      const quantityAsNumber = new BigNumberInBase(max)

      const toQuantity = orderTypeBuy
        ? quantityAsNumber.dividedBy(executionPrice)
        : executionPrice.times(quantityAsNumber)

      this.form.amount = max
      this.form.toAmount = toQuantity.toFormat(
        UI_DEFAULT_PRICE_DISPLAY_DECIMALS
      )

      this.updatePrices()
    },

    getBalance(token: Token): BigNumberInBase {
      const balances = this.subaccount?.balances

      if (!balances) {
        return new BigNumberInBase(0)
      }

      const balance = balances.find((b) => b.denom === token.denom)

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance).toBase(token.decimals)
    },

    getFormattedBalance(token: Token): string {
      return this.getBalance(token).toFormat(3, BigNumberInBase.ROUND_DOWN)
    },

    onSetFromToken(token: Token): void {
      const { toToken } = this

      if (toToken && toToken.denom === token.denom) {
        this.switchTokens()
        return
      }

      if (toToken) {
        if (!this.isValidMarket(token, toToken)) {
          // this.toToken = null
          this.fromToken = token
          // return
          // this.fromToken = this.getTokenBySymbol('usdt')

          // if (toToken.denom === 'usdt') {
          //   this.resetToDefaultMarket()
          // }
          return
        }
      }

      this.fromToken = token
      this.form.amount = ''
      this.form.toAmount = ''
    },

    onSetToToken(token: Token): void {
      const { fromToken } = this

      if (fromToken && fromToken.denom === token.denom) {
        this.switchTokens()
        return
      }

      if (fromToken) {
        if (!this.isValidMarket(fromToken, token)) {
          // this.fromToken = null
          this.toToken = token
          // return
          // this.toToken = this.getTokenBySymbol('usdt')
          // if (fromToken.denom === 'usdt') {
          //   this.resetToDefaultMarket()
          // }
          return
        }
      }

      this.toToken = token
      this.form.amount = ''
      this.form.toAmount = ''
    },

    resetToDefaultMarket(): void {
      const { fromToken, toToken } = this

      if (!fromToken || !toToken) {
        return
      }

      const pair = `${fromToken.symbol}/${toToken.symbol}`

      this.fromToken = this.getTokenBySymbol('usdt')
      this.toToken = this.getTokenBySymbol('inj')

      this.$toast.info(this.$t('trade.swap.reset_to_default_pair', { pair }))
    },

    switchTokens(): void {
      const { fromToken, toToken } = this

      const from = fromToken
      this.fromToken = toToken
      this.toToken = from

      // TODO: Come up with a robust way to handle modifying these values based on whatever values were already present.
      this.form.amount = ''
      this.form.toAmount = ''

      this.updatePrices()
    },

    updateOrderType(): void {
      const { fromToken, toToken } = this

      if (!fromToken || !toToken) {
        return
      }

      const market = this.findMarket(fromToken, toToken)

      if (!market) {
        return
      }

      this.orderType =
        market.baseDenom === fromToken.denom
          ? SpotOrderSide.Sell
          : SpotOrderSide.Buy
    },

    async updatePrices(): Promise<void> {
      const { fromToken, toToken } = this

      this.pricesPending = true

      if (fromToken) {
        const price = await this.$accessor.spot.fetchUsdPrice(
          fromToken.coinGeckoId
        )

        const priceAsBigNumber = new BigNumberInBase(price)

        const amount = new BigNumberInBase(Number(this.form.amount) || 0)

        this.fromUsdPrice = priceAsBigNumber
          .times(amount)
          .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
      }

      if (toToken) {
        const price = await this.$accessor.spot.fetchUsdPrice(
          toToken.coinGeckoId
        )

        const priceAsBigNumber = new BigNumberInBase(price)

        const amount = new BigNumberInBase(Number(this.form.toAmount) || 0)

        this.toUsdPrice = priceAsBigNumber
          .times(amount)
          .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
      }

      this.pricesPending = false
    },

    findMarket(
      fromToken: Token,
      toToken: Token
    ): UiSpotMarketWithToken | undefined {
      // TODO: Replace with simpler way to check if a market exists.
      const market = this.$accessor.spot.markets.find(
        (m: UiSpotMarketWithToken) => {
          return (
            (m.baseToken.denom === fromToken.denom &&
              m.quoteToken.denom === toToken.denom) ||
            (m.baseToken.denom === toToken.denom &&
              m.quoteToken.denom === fromToken.denom)
          )
        }
      )

      return market
    },

    isValidMarket(fromToken: Token, toToken: Token): boolean {
      return !!this.findMarket(fromToken, toToken)
    },

    toggleSwapSettingsModal(): void {
      if (!this.$popper) {
        return
      }

      const isActive = this.$popper.$el.hasAttribute('data-show')

      if (isActive) {
        this.$popper.hideDropdown()
        this.swapSettingsModalActive = false
      } else {
        this.$popper.showDropdown()
        this.swapSettingsModalActive = true
      }
    },

    hideSwapSettingsModal(): void {
      this.$popper.hideDropdown()
      this.swapSettingsModalActive = false
    },

    handleClickOrConnect(): void {
      this.$root.$emit('wallet-clicked')
    }
  }
})
</script>
