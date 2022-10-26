<template>
  <div class="bg-helixGray-950 rounded-xl py-8">
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
          :form-id="formId"
          class="input-convert"
          data-cy="convert-widget-from-input"
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
          show-input
          show-custom-indicator
          @input:amount="onSetAmount"
          @input:token="onSetFromToken"
          @input:max="onMaxInput"
        />
        <div class="flex justify-between items-center -my-2">
          <button
            type="button"
            class="rounded-full z-1000 flex items-center justify-center min-w-[32px] w-8 h-8 bg-primary-500 hover:bg-primary-600 relative mx-auto"
            data-cy="convert-widget-switch-sides-button"
            :class="{ 'opacity-50': status.isLoading() }"
            @click="switchTokens"
          >
            <IconArrowDown class="transform w-[10px] h-[10px]" />
          </button>
        </div>
        <TokenSelector
          :form-id="formId"
          class="input-convert"
          data-cy="convert-widget-to-input"
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
          show-input
          show-custom-indicator
          disable-max-selector
          @input:amount="onSetToAmount"
          @input:token="onSetToToken"
        />
      </div>
      <ConvertDetails
        :is-pending="fromUsdPricePending || fetchStatus.isLoading()"
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
        :has-liquidity="!emptyLiquidity && !amountTooBigToFillError"
      />
      <div class="mt-6">
        <VButton
          v-if="isUserWalletConnected"
          lg
          :status="status"
          :disabled="ctaButtonDisabled"
          :ghost="hasErrors"
          :primary="!hasErrors"
          class="w-full rounded"
          data-cy="convert-widget-submit-button"
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
          class="w-full rounded"
          data-cy="convert-widget-connect-wallet-button"
          :class="{ 'bg-opacity-50': status.isLoading() }"
          @click.stop="handleClickOrConnect"
        >
          {{ $t('trade.convert.connect_wallet') }}
        </VButton>
      </div>
      <span
        v-if="executionPriceHasHighDeviationWarning"
        class="block mt-4 text-2xs font-semibold text-red-200"
        data-cy="convert-widget-price-deviation-warning"
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
import Vue, { PropType } from 'vue'
import { TradeError } from 'types/errors'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType } from '@injectivelabs/ts-types'
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
import { isCosmosWallet, Wallet } from '@injectivelabs/wallet-ts'
import TokenSelector from './token-selector.vue'
import AdvancedSettings from './advanced-settings.vue'
import ConvertDetails from './convert-details.vue'
import ConvertErrors from './convert-errors.vue'
import {
  ConvertTradeError,
  ConvertTradeErrorLinkType,
  ConvertForm
} from './types'
import { sanitizeAmount } from './helpers'
import {
  DEFAULT_MARKET_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  DEFAULT_MAX_SLIPPAGE,
  ONE_IN_BASE
} from '~/app/utils/constants'
import ModalInsufficientInjForGas from '~/components/partials/modals/insufficient-inj-for-gas.vue'
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

  props: {
    fetchStatus: {
      required: false,
      type: Object as PropType<Status>,
      default: () => new Status()
    },

    fromToken: {
      type: Object as PropType<Token>,
      default: undefined
    },

    toToken: {
      type: Object as PropType<Token>,
      default: undefined
    },

    market: {
      type: Object as PropType<UiSpotMarketWithToken>,
      default: undefined
    },

    orderType: {
      type: String as PropType<SpotOrderSide>,
      required: true
    },

    tokensWithBalances: {
      type: Array as PropType<BankBalanceWithTokenAndBalance[]>,
      required: true
    },

    fromUsdPrice: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      ConvertTradeErrorLinkType,
      TradeExecutionType,
      SpotOrderSide,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      detailsDrawerOpen: true,
      status: new Status(),
      formId: 0,
      form: initialForm(),
      toUsdPrice: new BigNumberInBase(0).toFormat(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      ),
      fromUsdPricePending: false
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
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

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    hasEnoughInjForGasOrNotCosmosWallet(): boolean {
      const { wallet, hasEnoughInjForGas } = this

      if (!isCosmosWallet(wallet)) {
        return true
      }

      return hasEnoughInjForGas
    },

    fromAmount(): string {
      const { amount } = this.form

      return sanitizeAmount(amount)
    },

    toAmount(): string {
      const { toAmount } = this.form

      return sanitizeAmount(toAmount)
    },

    ctaButtonLabel(): string {
      const { availableBalanceError, amountTooBigToFillError, emptyLiquidity } =
        this

      if (amountTooBigToFillError || emptyLiquidity) {
        return this.$t('trade.convert.insufficient_liquidity')
      }

      if (availableBalanceError) {
        return this.$t('trade.convert.insufficient_balance')
      }

      return this.$t('trade.convert.convert')
    },

    ctaButtonDisabled(): boolean {
      const { hasErrors, hasEnoughInjForGasOrNotCosmosWallet } = this

      return hasErrors || !hasEnoughInjForGasOrNotCosmosWallet
    },

    showErrors(): boolean | undefined {
      const {
        market,
        amountError,
        priceError,
        hasEnoughInjForGasOrNotCosmosWallet
      } = this

      return (
        market &&
        !!(amountError || priceError || !hasEnoughInjForGasOrNotCosmosWallet)
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
      const amount = sanitizeAmount(this.form.amount) || 0

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

    emptyLiquidity(): ConvertTradeError | undefined {
      const { orderTypeBuy, sells, buys, hasAmount } = this

      if (!hasAmount) {
        return
      }

      const orders = orderTypeBuy ? sells : buys

      if (orders.length <= 0) {
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

      const amount = sanitizeAmount(form.amount)

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

      if (this.emptyLiquidity) {
        return this.emptyLiquidity
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

    marketsCompatibleWithFromToken(): UiSpotMarketWithToken[] {
      const { fromToken, markets } = this

      if (!fromToken) {
        return []
      }

      return markets.filter(
        (market: UiSpotMarketWithToken) =>
          market.baseDenom === fromToken.denom ||
          market.quoteDenom === fromToken.denom
      )
    },

    fromTokens(): BankBalanceWithTokenAndBalance[] {
      const { tokensWithBalances, markets } = this

      return tokensWithBalances.filter(
        (tokenWithBalance: BankBalanceWithTokenAndBalance) => {
          return !!markets.find(
            (market: UiSpotMarketWithToken) =>
              market.baseDenom === tokenWithBalance.denom ||
              market.quoteDenom === tokenWithBalance.denom
          )
        }
      )
    },

    toTokens(): BankBalanceWithTokenAndBalance[] {
      const { tokensWithBalances, marketsCompatibleWithFromToken } = this

      return tokensWithBalances.filter(
        (tokenWithBalance: BankBalanceWithTokenAndBalance) => {
          return marketsCompatibleWithFromToken.find(
            (market: UiSpotMarketWithToken) =>
              market.baseDenom === tokenWithBalance.denom ||
              market.quoteDenom === tokenWithBalance.denom
          )
        }
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
    }
  },

  watch: {
    fromToken() {
      this.$emit('update:prices')
    },

    toToken() {
      this.$emit('update:prices')
    }
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
          this.resetForm()
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    resetForm(): void {
      this.$set(this, 'form', initialForm())
      this.formId += 1
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

      this.$emit('update:prices')

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

      this.$emit('update:prices')

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

      this.$emit('update:prices')

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

      this.$emit('update:from-token', token)

      this.form.amount = ''
      this.form.toAmount = ''
    },

    onSetToToken(token: Token): void {
      const { fromToken } = this

      if (fromToken && fromToken.denom === token.denom) {
        this.switchTokens()
        return
      }

      this.$emit('update:to-token', token)

      this.form.amount = ''
      this.form.toAmount = ''
    },

    switchTokens(): void {
      const { fromToken, toToken, status } = this

      if (status.isLoading()) {
        return
      }

      this.$emit('update:switch', { from: toToken, to: fromToken })

      // TODO: Come up with a robust way to handle modifying these values based on whatever values were already present.
      this.form.amount = ''
      this.form.toAmount = ''

      this.$emit('update:prices')
    },

    handleClickOrConnect(): void {
      this.$root.$emit('wallet-clicked')
    }
  }
})
</script>
