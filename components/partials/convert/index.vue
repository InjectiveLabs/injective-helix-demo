<template>
  <div class="bg-gray-800 rounded-xl py-8">
    <div class="px-8 w-full">
      <div class="flex items-center justify-between mb-8">
        <span class="font-bold text-lg">
          {{ $t('trade.convert.convert') }}
        </span>
        <AdvancedSettings
          :status="status"
          :warnings="slippageWarnings"
          :errors="slippageErrors"
          :slippage-tolerance="form.slippageTolerance"
          @set-slippage-tolerance="setSlippageTolerance"
        />
      </div>
      <div>
        <TokenSelector
          class="input-convert"
          :disabled="status && status.isLoading()"
          :amount="fromAmount"
          :balance="fromBalance"
          :balance-decimal-places="market && market.quantityDecimals"
          :value="fromToken"
          :tokens="fromTokens"
          :placeholder="'Select a token'"
          :prefix="orderTypeBuy ? '&asymp;' : null"
          :usd-price="fromUsdPrice"
          :step="orderTypeBuy ? priceStep : amountStep"
          :max-decimals="maxDecimalsFrom"
          @input:amount="onSetAmount"
          @input:token="onSetFromToken"
          @input:max="onMaxInput"
        />
        <div class="flex justify-between items-center -my-2">
          <button
            type="button"
            class="rounded-full z-1000 flex items-center justify-center min-w-[32px] w-8 h-8 bg-primary-600 hover:bg-primary-500 relative mx-auto"
            :class="{ 'opacity-50': status.isLoading() }"
            @click="switchTokens"
          >
            <IconArrowDown class="transform w-[10px] h-[10px]" />
          </button>
        </div>
        <TokenSelector
          class="input-convert"
          :disabled="status && status.isLoading()"
          :amount="toAmount"
          :balance="toBalance"
          :balance-decimal-places="market && market.quantityDecimals"
          :value="toToken"
          :tokens="toTokens"
          :placeholder="'Select a token'"
          :prefix="orderTypeBuy ? null : '≈'"
          :validation-rules="'positiveNumber'"
          :step="orderTypeBuy ? amountStep : priceStep"
          :max-decimals="maxDecimalsTo"
          disable-max-selector
          @input:amount="onSetToAmount"
          @input:token="onSetToToken"
        />
      </div>
      <ConvertDetails
        v-if="market && fromToken && toToken"
        :pending="pricesPending"
        :from-token="fromToken"
        :to-token="toToken"
        :amount="amount"
        :from-amount="fromAmount"
        :to-amount="toAmount"
        :fee="fee"
        :market="market"
        :order-type="orderType"
        :slippage="slippage"
        :fee-rate="feeRate"
      />
      <div class="mt-6">
        <VButton
          v-if="isUserWalletConnected"
          lg
          :status="status"
          :disabled="ctaButtonDisabled"
          :ghost="hasErrors"
          :primary="!hasErrors"
          class="w-full"
          :class="{ 'bg-opacity-50': status.isLoading() }"
          @click.stop="onSubmit"
        >
          {{ ctaButtonLabel }}
        </VButton>
        <VButton
          v-else
          lg
          :status="status"
          primary
          class="w-full"
          :class="{ 'bg-opacity-50': status.isLoading() }"
          @click.stop="handleClickOrConnect"
        >
          {{ $t('trade.convert.connect_wallet') }}
        </VButton>
      </div>
      <span
        v-if="executionPriceHasHighDeviationWarning"
        class="block mt-4 text-2xs font-semibold text-red-200"
      >
        {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
      </span>
      <ConvertErrors
        v-if="showErrors"
        :errors="errors"
        :show-portfolio-link="
          errors.linkType === ConvertTradeErrorLinkType.Portfolio
        "
        :show-hub-link="errors.linkType === ConvertTradeErrorLinkType.Hub"
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
  NUMBER_REGEX,
  ZERO_IN_BASE,
  UiPriceLevel,
  UiSpotMarketWithToken,
  UiSpotOrderbook,
  UiSubaccount,
  BankBalanceWithTokenAndBalance,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
  FeeDiscountAccountInfo,
  getDecimalsFromNumber
} from '@injectivelabs/sdk-ts'
import { Token } from '@injectivelabs/token-metadata'
import TokenSelector from './token-selector.vue'
import AdvancedSettings from './advanced-settings.vue'
import ConvertDetails from './convert-details.vue'
import ConvertErrors from './convert-errors.vue'
import {
  ConvertTradeError,
  ConvertTradeErrorLinkType,
  ConvertForm
} from './types'
import {
  DEFAULT_MARKET_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  DEFAULT_MAX_SLIPPAGE,
  ONE_IN_BASE
} from '~/app/utils/constants'
import ModalInsufficientInjForGas from '~/components/partials/modals/insufficient-inj-for-gas.vue'
import { Modal } from '~/types'
import {
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceUsingQuoteAmountAndOrderbook
} from '~/app/client/utils/spot'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'

const initialForm = (): ConvertForm => ({
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
    ConvertDetails,
    ConvertErrors
  },

  data() {
    return {
      ConvertTradeErrorLinkType,
      TradeExecutionType,
      SpotOrderSide,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      orderType: SpotOrderSide.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm(),
      fromToken: null as Token | null,
      toToken: null as Token | null,
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
    fromAmount(): string {
      const { amount } = this.form

      return this.sanitizeAmount(amount)
    },

    toAmount(): string {
      const { toAmount } = this.form

      return this.sanitizeAmount(toAmount)
    },

    ctaButtonLabel(): string {
      const {
        availableBalanceError,
        amountTooBigToFillError,
        notEnoughOrdersToFillFromError
      } = this

      if (amountTooBigToFillError || notEnoughOrdersToFillFromError) {
        return this.$t('trade.convert.insufficient_liquidity')
      }

      if (availableBalanceError) {
        return this.$t('trade.convert.insufficient_balance')
      }

      return this.$t('trade.convert.convert_now')
    },

    ctaButtonDisabled(): boolean {
      const { hasErrors, hasEnoughInjForGasOrNotKeplr } = this

      return hasErrors || !hasEnoughInjForGasOrNotKeplr
    },

    showErrors(): boolean | undefined {
      const { market, amountError, priceError, hasEnoughInjForGasOrNotKeplr } =
        this

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
        result.push(this.$t('trade.convert.high_slippage_warning'))
      }

      if (slippageTolerance.lt(new BigNumberInBase(0.05))) {
        result.push(this.$t('trade.convert.low_slippage_warning'))
      }

      return result
    },

    slippageErrors(): Array<string> {
      const slippageTolerance = new BigNumberInBase(this.form.slippageTolerance)

      const result = []

      if (slippageTolerance.gt(new BigNumberInBase(50))) {
        result.push(this.$t('trade.convert.slippage_too_high'))
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
      const amount = this.sanitizeAmount(this.form.amount) || 0

      return new BigNumberInBase(amount)
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

    feeRate(): BigNumberInBase {
      const { takerFeeRate, takerFeeRateDiscount } = this

      return takerFeeRate.times(ONE_IN_BASE.minus(takerFeeRateDiscount))
    },

    price(): BigNumberInBase {
      return new BigNumberInBase(this.form.price)
    },

    executionPrice(): BigNumberInBase {
      const { orderTypeBuy, sells, buys, hasAmount, market, slippage, amount } =
        this

      const records = orderTypeBuy ? sells : buys

      if (!market || !hasAmount || records.length === 0) {
        return ZERO_IN_BASE
      }

      const averagePrice = calculateAverageExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return new BigNumberInBase(
        averagePrice.times(slippage).toFixed(market.priceDecimals)
      )
    },

    executionPriceWithoutSlippage(): BigNumberInBase {
      const {
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        fromAmount,
        toAmount
      } = this

      const records = orderTypeBuy ? sells : buys

      if (!market || !hasAmount || records.length === 0) {
        return ZERO_IN_BASE
      }

      const fromAmountAsNumber =
        fromAmount !== '' ? new BigNumberInBase(fromAmount) : ZERO_IN_BASE

      const toAmountAsNumber =
        toAmount !== '' ? new BigNumberInBase(toAmount) : ZERO_IN_BASE

      const quantity = orderTypeBuy ? toAmountAsNumber : fromAmountAsNumber

      const averagePrice = calculateAverageExecutionPriceFromOrderbook({
        records,
        amount: quantity,
        market
      })

      return new BigNumberInBase(averagePrice.toFixed(market.priceDecimals))
    },

    worstPrice(): BigNumberInBase {
      const { orderTypeBuy, slippage, sells, buys, hasAmount, market, amount } =
        this

      if (!market || !hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const worstPrice = orderTypeBuy
        ? calculateWorstExecutionPriceUsingQuoteAmountAndOrderbook({
            records,
            market,
            amount
          })
        : calculateWorstExecutionPriceFromOrderbook({
            records,
            amount,
            market
          })

      return new BigNumberInBase(
        worstPrice
          .times(slippage)
          .toFixed(
            orderTypeBuy ? market.quantityDecimals : market.priceDecimals
          )
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

    maxDecimalsFrom(): number {
      const { orderTypeBuy, priceStep, amountStep } = this

      return getDecimalsFromNumber(
        Number(orderTypeBuy ? priceStep : amountStep)
      )
    },

    maxDecimalsTo(): number {
      const { orderTypeBuy, priceStep, amountStep } = this

      return getDecimalsFromNumber(
        Number(orderTypeBuy ? amountStep : priceStep)
      )
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

    availableBalanceError(): ConvertTradeError | undefined {
      const {
        quoteAvailableBalance,
        baseAvailableBalance,
        orderTypeBuy,
        fromToken,
        fromAmount
      } = this

      if (fromAmount === '') {
        return undefined
      }

      const amount = new BigNumberInBase(fromAmount)

      if (amount.eq(ZERO_IN_BASE)) {
        return undefined
      }

      if (orderTypeBuy) {
        if (quoteAvailableBalance.lt(amount)) {
          return {
            price: this.$t('trade.convert.insufficient_balance_verbose', {
              symbol: fromToken ? fromToken.symbol : ''
            }),
            linkType: ConvertTradeErrorLinkType.Portfolio
          }
        }
        return undefined
      }

      if (baseAvailableBalance.lt(amount)) {
        return {
          amount: this.$t('trade.convert.insufficient_balance_verbose', {
            symbol: fromToken ? fromToken.symbol : ''
          }),
          linkType: ConvertTradeErrorLinkType.Portfolio
        }
      }

      return undefined
    },

    notEnoughOrdersToFillFromError(): ConvertTradeError | undefined {
      const { orderTypeBuy, sells, buys, hasAmount, fromAmount, toAmount } =
        this

      if (!hasAmount) {
        return
      }

      const quantity = orderTypeBuy
        ? new BigNumberInBase(toAmount)
        : new BigNumberInBase(fromAmount)

      const orders = orderTypeBuy ? sells : buys

      if (orders.length <= 0 && quantity.gt(0)) {
        return {
          amount: this.$t('trade.not_enough_fillable_orders'),
          linkType: ConvertTradeErrorLinkType.None
        }
      }

      return undefined
    },

    amountTooBigToFillError(): ConvertTradeError | undefined {
      const {
        hasPrice,
        hasAmount,
        orderTypeBuy,
        sells,
        buys,
        market,
        fromAmount,
        toAmount
      } = this

      if (!hasPrice || !hasAmount || !market) {
        return
      }

      const quantity = orderTypeBuy
        ? new BigNumberInBase(toAmount)
        : new BigNumberInBase(fromAmount)

      const orders = orderTypeBuy ? sells : buys

      const totalAmount = orders.reduce((totalAmount, { quantity }) => {
        return totalAmount.plus(
          new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
        )
      }, ZERO_IN_BASE)

      if (totalAmount.lt(quantity)) {
        return {
          amount: this.$t('trade.not_enough_fillable_orders'),
          linkType: ConvertTradeErrorLinkType.None
        }
      }

      return undefined
    },

    priceNotValidError(): ConvertTradeError | undefined {
      const { form } = this

      if (!form.price) {
        return undefined
      }

      if (NUMBER_REGEX.test(form.price)) {
        return undefined
      }

      return {
        price: this.$t('trade.not_valid_number'),
        linkType: ConvertTradeErrorLinkType.None
      }
    },

    amountNotValidNumberError(): ConvertTradeError | undefined {
      const { form } = this

      if (!form.amount) {
        return undefined
      }

      const amount = this.sanitizeAmount(form.amount)

      if (NUMBER_REGEX.test(amount)) {
        return undefined
      }

      return {
        amount: this.$t('trade.not_valid_number'),
        linkType: ConvertTradeErrorLinkType.None
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
      const {
        priceError,
        amountError,
        hasAmount,
        amount,
        fromAmount,
        toAmount
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

      if (fromAmount === '' || toAmount === '') {
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
      const { executionPrice, amount, feeRate } = this

      return executionPrice.times(amount.times(feeRate))
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

    fee(): BigNumberInBase {
      const {
        orderTypeBuy,
        fromAmount,
        toAmount,
        executionPriceWithoutSlippage,
        takerFeeRate,
        takerFeeRateDiscount
      } = this

      const quantity = orderTypeBuy
        ? new BigNumberInBase(toAmount)
        : new BigNumberInBase(fromAmount)

      if (quantity.isNaN() || quantity.eq(ZERO_IN_BASE)) {
        return ZERO_IN_BASE
      }

      const discount = new BigNumberInBase(1).minus(takerFeeRateDiscount)

      const fee = executionPriceWithoutSlippage
        .times(quantity)
        .times(takerFeeRate)
        .times(discount)

      return fee
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

    let from = (this.$route.query.from as string) || 'usdt'
    let to = (this.$route.query.to as string) || 'inj'

    if (!this.isTokenSymbolValid(from)) {
      this.$toast.error(
        this.$t('trade.convert.invalid_token_symbol_warning', {
          symbol: from.toUpperCase(),
          defaultSymbol: 'USDT'
        })
      )
      from = 'usdt'
    }

    if (!this.isTokenSymbolValid(to)) {
      this.$toast.error(
        this.$t('trade.convert.invalid_token_symbol_warning', {
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
    calculateAverageExecutionPriceWithoutSlippage(
      amount: BigNumberInBase
    ): BigNumberInBase {
      const { orderTypeBuy, sells, buys, market } = this

      const records = orderTypeBuy ? sells : buys

      if (!market || amount.eq(ZERO_IN_BASE) || records.length === 0) {
        return ZERO_IN_BASE
      }

      const averagePrice = calculateAverageExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return new BigNumberInBase(averagePrice.toFixed(market.priceDecimals))
    },

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

    submitMarketOrder(): void {
      const { orderType, orderTypeBuy, market, form } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      const price = this.worstPrice

      const quantity = orderTypeBuy
        ? new BigNumberInBase(form.toAmount)
        : new BigNumberInBase(form.amount)

      this.$accessor.spot
        .submitMarketOrder({
          quantity,
          price,
          orderType
        })
        .then(() => {
          this.$toast.success(this.$t('trade.convert.convert_success'))
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
      const { orderTypeBuy, market, fromToken, feeRate } = this

      this.updatePrices()

      this.form.amount = quantity

      if (quantity === '') {
        this.form.toAmount = ''
        return
      }

      if (!market) {
        return
      }

      const quantityAsNumber = new BigNumberInBase(quantity)

      const executionPriceWithoutSlippage =
        this.calculateAverageExecutionPriceWithoutSlippage(quantityAsNumber)

      if (!fromToken || executionPriceWithoutSlippage.eq(ZERO_IN_BASE)) {
        return
      }

      const toAmount = orderTypeBuy
        ? quantityAsNumber.dividedBy(
            executionPriceWithoutSlippage.times(ONE_IN_BASE.plus(feeRate))
          )
        : quantityAsNumber
            .times(executionPriceWithoutSlippage)
            .times(ONE_IN_BASE.minus(feeRate))

      const decimalPlaces = orderTypeBuy
        ? market.priceDecimals
        : market.quantityDecimals

      this.form.toAmount = toAmount.toFormat(decimalPlaces)
    },

    onSetToAmount(quantity: string) {
      const { orderTypeBuy, market, toToken, feeRate } = this

      this.updatePrices()

      this.form.toAmount = quantity

      if (quantity === '') {
        this.form.amount = ''
        return
      }

      if (!market) {
        return
      }

      const quantityAsNumber = new BigNumberInBase(quantity)

      const executionPriceWithoutSlippage =
        this.calculateAverageExecutionPriceWithoutSlippage(quantityAsNumber)

      if (!toToken || executionPriceWithoutSlippage.eq(ZERO_IN_BASE)) {
        return
      }

      const fromAmount = orderTypeBuy
        ? quantityAsNumber
            .times(executionPriceWithoutSlippage)
            .times(ONE_IN_BASE.plus(feeRate))
        : quantityAsNumber.dividedBy(
            executionPriceWithoutSlippage.times(ONE_IN_BASE.minus(feeRate))
          )

      const decimalPlaces = orderTypeBuy
        ? market.priceDecimals
        : market.quantityDecimals

      this.form.amount = fromAmount.toFormat(decimalPlaces)
    },

    onMaxInput(max: string): void {
      const { orderTypeBuy, executionPrice, feeRate, market } = this

      this.updatePrices()

      this.form.amount = max

      if (executionPrice.eq(ZERO_IN_BASE) || !market) {
        return
      }

      const quantityAsNumber = new BigNumberInBase(max)

      const toQuantity = orderTypeBuy
        ? quantityAsNumber.dividedBy(
            executionPrice.times(ONE_IN_BASE.plus(feeRate))
          )
        : quantityAsNumber.times(
            executionPrice.times(ONE_IN_BASE.minus(feeRate))
          )

      const decimalPlaces = orderTypeBuy
        ? market.priceDecimals
        : market.quantityDecimals

      this.form.toAmount = toQuantity.toFormat(decimalPlaces)
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
          this.fromToken = token
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
          this.toToken = token
          return
        }
      }

      this.toToken = token
      this.form.amount = ''
      this.form.toAmount = ''
    },

    sanitizeAmount(amount: string): string {
      let result = amount

      // Transforms 12,345.67 to 12345.67
      result = result.replace(/,/gim, '')

      // Transforms 12. to 12
      if (result.endsWith('.')) {
        return result.replace(/\./gim, '')
      }

      return result
    },

    resetToDefaultMarket(): void {
      const { fromToken, toToken } = this

      if (!fromToken || !toToken) {
        return
      }

      const pair = `${fromToken.symbol}/${toToken.symbol}`

      this.fromToken = this.getTokenBySymbol('usdt')
      this.toToken = this.getTokenBySymbol('inj')

      this.$toast.info(this.$t('trade.convert.reset_to_default_pair', { pair }))
    },

    switchTokens(): void {
      const { fromToken, toToken, status } = this

      if (status.isLoading()) {
        return
      }

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

        const amount = this.sanitizeAmount(this.form.amount)

        const quantity = new BigNumberInBase(amount || 0)

        this.fromUsdPrice = priceAsBigNumber
          .times(quantity)
          .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
      }

      if (toToken) {
        const price = await this.$accessor.spot.fetchUsdPrice(
          toToken.coinGeckoId
        )

        const priceAsBigNumber = new BigNumberInBase(price)

        const amount = this.sanitizeAmount(this.form.toAmount)

        const quantity = new BigNumberInBase(amount || 0)

        this.toUsdPrice = priceAsBigNumber
          .times(quantity)
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

    handleClickOrConnect(): void {
      this.$root.$emit('wallet-clicked')
    }
  }
})
</script>
