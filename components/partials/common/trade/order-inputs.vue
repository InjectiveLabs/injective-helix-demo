<template>
  <div>
    <VInput
      v-if="tradingTypeLimit"
      id="input-price"
      ref="input-price"
      class="mb-6"
      :value="inputPrice"
      :placeholder="priceStep"
      :label="$t('trade.price')"
      :disabled="tradingTypeMarket"
      type="number"
      :step="priceStep"
      :max-decimals="market ? market.quoteToken.decimals : 6"
      min="0"
      data-cy="trading-page-price-input"
      show-addon
      @input="onPriceChange"
    >
      <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
    </VInput>

    <VInput
      v-if="tradingTypeStopLimit || tradingTypeStopMarket"
      id="trigger-price"
      ref="trigger-price"
      class="mb-6"
      :value="inputTriggerPrice"
      :placeholder="priceStep"
      :label="$t('trade.trigger_price')"
      :disabled="tradingTypeMarket || tradingTypeLimit"
      type="number"
      :step="priceStep"
      :max-decimals="market ? market.quoteToken.decimals : 6"
      min="0"
      data-cy="trading-page-trigger-price-input"
      show-addon
      @input="onTriggerPriceChange"
    >
      <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
    </VInput>

    <VInput
      v-if="tradingTypeStopLimit"
      id="limit-price"
      ref="limit-price"
      class="mb-6"
      :value="inputPrice"
      :placeholder="priceStep"
      :label="$t('trade.limit_price')"
      :disabled="!tradingTypeStopLimit"
      type="number"
      :step="priceStep"
      :max-decimals="market ? market.quoteToken.decimals : 6"
      min="0"
      data-cy="trading-page-price-input"
      show-addon
      @input="onPriceChange"
    >
      <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
    </VInput>

    <div class="flex gap-3">
      <VInput
        ref="input-amount"
        v-model="inputBaseAmount"
        :label="$t('trade.amount')"
        :custom-handler="true"
        :max-decimals="market ? market.quantityDecimals : 6"
        :placeholder="amountStep"
        type="number"
        :step="amountStep"
        min="0"
        data-cy="trading-page-base-amount-input"
        show-addon
        @input="onAmountChange"
      >
        <span slot="addon">{{ market.baseToken.symbol.toUpperCase() }}</span>
        <div
          slot="context"
          class="text-xs text-gray-400 flex items-center font-mono"
        ></div>
      </VInput>

      <VInput
        v-if="!tradingTypeMarket"
        ref="input-quote-amount"
        v-model="inputQuoteAmount"
        :custom-handler="true"
        :max-decimals="market ? market.priceDecimals : 6"
        :placeholder="amountStep"
        type="number"
        :step="amountStep"
        min="0"
        data-cy="trading-page-quote-amount-input"
        show-prefix
        show-addon
        @input="onQuoteAmountChange"
      >
        <span slot="prefix">≈</span>
        <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>

        <PercentAmountOptions
          slot="context"
          v-bind="{
            baseAvailableBalance,
            buys,
            executionPrice,
            hasPrice,
            inputPostOnly,
            leverage,
            makerFeeRate,
            market,
            maxReduceOnly,
            orderTypeBuy,
            orderTypeReduceOnly,
            position,
            quoteAvailableBalance,
            quoteAvailableBalance,
            sells,
            sells,
            slippage,
            takerFeeRate,
            tradingTypeMarket,
            worstPrice
          }"
          ref="percentageOptions"
          :proportional-percentage="inputProportionalPercentage"
          @update:proportionalPercentage="updateProportionalPercentage"
          @update:quoteAmountFromPercentage="updateQuoteAmountFromPercentage"
          @update:baseAmountFromPercentage="updateBaseAmountFromPercentage"
          @update:priceFromLastTradedPrice="updatePriceFromLastTradedPrice"
        />
      </VInput>
    </div>

    <InputError
      v-bind="{
        amount: inputBaseAmountToBigNumber,
        baseAvailableBalance,
        buys,
        executionPrice,
        hasAmount,
        hasInputErrors,
        hasPrice,
        hasQuoteAmount,
        inputProportionalPercentage,
        lastTradedPrice,
        leverage: inputLeverage,
        market,
        maxReduceOnly,
        notionalValueWithFees,
        notionalWithLeverage,
        notionalWithLeverageBasedOnWorstPrice,
        notionalWithLeverageAndFees,
        orderTypeBuy,
        orderTypeReduceOnly,
        potentiallyShowPercentageWarning,
        quoteAmount: inputQuoteAmountToBigNumber,
        quoteAvailableBalance,
        sells,
        tradingTypeLimit,
        tradingTypeMarket,
        tradingTypeStopLimit,
        tradingTypeStopMarket,
        worstPrice,
        triggerPrice,
        markPrice
      }"
      @update:hasInputErrors="updateHasInputErrors"
    />

    <OrderLeverage
      v-if="
        !orderTypeReduceOnly &&
        !isSpot &&
        market.subType !== MarketType.BinaryOptions
      "
      class="mt-6"
      :leverage="leverage"
      :max-leverage="maxLeverageAvailable.toFixed()"
      @change="onLeverageChange"
    />

    <OrderLeverageSelect
      v-if="false"
      class="mt-4"
      :max-leverage="maxLeverageAvailable.toFixed()"
      :leverage="leverage"
      @change="onLeverageChange"
    />

    <AdvancedSettings
      :trading-type="tradingType"
      :slippage-tolerance="inputSlippageTolerance"
      :post-only="inputPostOnly"
      :reduce-only="inputReduceOnly"
      :reduce-only-disabled="!showReduceOnly"
      :leverage="inputLeverage"
      :has-advanced-settings-errors="hasAdvancedSettingsErrors"
      :is-conditional-order="isConditionalOrder"
      :is-spot="isSpot"
      :form-id="formId"
      @set:postOnly="setPostOnly"
      @set:reduceOnly="setReduceOnly"
      @set:slippageTolerance="setSlippageTolerance"
      @update:hasAdvancedSettingsErrors="updateHasAdvancedSettingsErrors"
    />
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  UiDerivativeLimitOrder,
  UiPriceLevel,
  UiPosition,
  ZERO_IN_BASE,
  SpotOrderSide,
  DerivativeOrderSide,
  UiPerpetualMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import OrderLeverage from '~/components/partials/derivatives/trading/order-leverage.vue'
import OrderLeverageSelect from '~/components/partials/derivatives/trading/order-leverage-select.vue'
import { AveragePriceOptions } from '~/types'
import PercentAmountOptions from '~/components/partials/common/trade/percent-amount-options.vue'
import InputError from '~/components/partials/common/trade/input-error.vue'
import AdvancedSettings from '~/components/partials/common/trade/advanced-settings/index.vue'
import {
  formatPriceToAllowableDecimals,
  formatAmountToAllowableDecimals
} from '~/app/utils/formatters'

export default Vue.extend({
  components: {
    PercentAmountOptions,
    InputError,
    AdvancedSettings,
    OrderLeverage,
    OrderLeverageSelect
  },

  props: {
    averagePrice: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
    },

    market: {
      type: Object as PropType<
        | UiSpotMarketWithToken
        | UiPerpetualMarketWithToken
        | UiExpiryFuturesMarketWithToken
      >,
      required: true
    },

    tradingType: {
      type: String as PropType<TradeExecutionType>,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeLimit: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeStopMarket: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeStopLimit: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    price: {
      type: String,
      required: true
    },

    showReduceOnly: {
      type: Boolean,
      default: false
    },

    orderType: {
      type: String as PropType<SpotOrderSide | DerivativeOrderSide>,
      required: true
    },

    amount: {
      type: String,
      required: true
    },

    quoteAmount: {
      type: String,
      required: true
    },

    proportionalPercentage: {
      type: Number,
      required: true
    },

    lastTradedPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    baseAvailableBalance: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    quoteAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    sells: {
      type: Array as PropType<UiPriceLevel[]>,
      required: true
    },

    buys: {
      type: Array as PropType<UiPriceLevel[]>,
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

    hasPrice: {
      type: Boolean,
      required: true
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    worstPrice: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    triggerPrice: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    markPrice: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    hasInputErrors: {
      type: Boolean,
      required: true
    },

    fees: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    notionalValueWithFees: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    notionalWithLeverageAndFees: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    hasAmount: {
      type: Boolean,
      required: true
    },

    hasAdvancedSettingsErrors: {
      type: Boolean,
      required: true
    },

    averagePriceOption: {
      type: Number as PropType<AveragePriceOptions>,
      required: true
    },

    reduceOnly: {
      type: Boolean,
      default: false
    },

    orderTypeReduceOnly: {
      type: Boolean,
      default: false
    },

    position: {
      type: Object as PropType<UiPosition> | undefined,
      default: undefined
    },

    notionalWithLeverage: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    notionalWithLeverageBasedOnWorstPrice: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    slippage: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    leverage: {
      type: String,
      default: undefined
    },

    isConditionalOrder: {
      type: Boolean,
      required: true
    },

    formId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      MarketType,
      inputBaseAmount: '',
      inputQuoteAmount: '',
      inputPrice: '',
      inputTriggerPrice: '',
      inputPostOnly: false,
      inputProportionalPercentage: 0,
      inputSlippageTolerance: '0.5',
      inputReduceOnly: false,
      inputLeverage: '1',
      potentiallyShowPercentageWarning: false
    }
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    $percentageOptions(): any {
      return this.$refs.percentageOptions
    },

    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    isSpot(): boolean {
      return this.$route.name === 'spot-spot'
    },

    inputQuoteAmountToBigNumber(): BigNumberInBase {
      const { inputQuoteAmount } = this

      return new BigNumberInBase(inputQuoteAmount)
    },

    inputBaseAmountToBigNumber(): BigNumberInBase {
      const { inputBaseAmount } = this

      return new BigNumberInBase(inputBaseAmount)
    },

    hasQuoteAmount(): boolean {
      const { inputQuoteAmountToBigNumber, priceStep } = this

      return (
        !inputQuoteAmountToBigNumber.isNaN() &&
        inputQuoteAmountToBigNumber.gt(0) &&
        inputQuoteAmountToBigNumber.gte(priceStep)
      )
    },

    maxLeverageAvailable(): BigNumberInBase {
      const { market, isSpot } = this

      if (isSpot || !market) {
        return ZERO_IN_BASE
      }

      const maxLeverage = new BigNumberInBase(
        new BigNumberInBase(1)
          .dividedBy(
            (
              market as
                | UiPerpetualMarketWithToken
                | UiExpiryFuturesMarketWithToken
            ).initialMarginRatio
          )
          .dp(0)
      )

      const steps = [1, 2, 5, 10, 20, 50, 100, 150, 200]

      const stepsLessThanMaxLeverage = steps.filter(
        (step) => step <= maxLeverage.toNumber()
      )

      return stepsLessThanMaxLeverage.length > 0
        ? new BigNumberInBase(
            stepsLessThanMaxLeverage[stepsLessThanMaxLeverage.length - 1]
          )
        : new BigNumberInBase(20)
    },

    maxReduceOnly(): BigNumberInBase {
      const { isSpot, market, position, orders, orderTypeReduceOnly } = this

      if (isSpot || !orderTypeReduceOnly || !position || !market) {
        return ZERO_IN_BASE
      }

      const reduceOnlyOrders = orders.filter(
        (o) => o.isReduceOnly && o.marketId === market.marketId
      )

      const aggregateReduceOnlyQuantity = reduceOnlyOrders.reduce(
        (total, order) => total.plus(order.quantity),
        ZERO_IN_BASE
      )

      return new BigNumberInBase(position.quantity).minus(
        aggregateReduceOnlyQuantity
      )
    },

    amountStep(): string {
      const { market } = this

      if (!market) {
        return '1'
      }

      return new BigNumberInBase(1)
        .shiftedBy(-market.quantityDecimals)
        .toFixed()
    },

    priceStep(): string {
      const { market } = this

      if (!market) {
        return '1'
      }

      return new BigNumberInBase(1).shiftedBy(-market.priceDecimals).toFixed()
    }
  },

  watch: {
    lastTradedPrice: {
      handler(newPrice: BigNumberInBase) {
        const { price, market, tradingTypeStopLimit } = this

        if (!market || tradingTypeStopLimit) {
          return
        }

        if (!Number(price) && !newPrice.eq('0')) {
          const formattedPrice = newPrice.toFixed(market.priceDecimals)

          this.inputPrice = formattedPrice
          this.$emit('update:price', formattedPrice)
        }
      },
      immediate: true
    },

    price(newPrice: string) {
      const { tradingTypeStopLimit } = this

      if (tradingTypeStopLimit) {
        return
      }

      this.inputPrice = newPrice
    },

    executionPrice() {
      const { averagePriceOption, inputBaseAmount, inputQuoteAmount } = this

      if (averagePriceOption === AveragePriceOptions.QuoteAmount) {
        this.onQuoteAmountChange(inputQuoteAmount)
      } else if (averagePriceOption === AveragePriceOptions.BaseAmount) {
        this.onAmountChange(inputBaseAmount)
      }
    },

    formId() {
      this.reset()
    }
  },

  mounted() {
    const { amountStep } = this

    this.onAmountChange(amountStep)
  },

  methods: {
    updateBaseAmountFromPercentage(amount: string) {
      this.inputBaseAmount = amount

      this.$emit('update:amount', amount)
    },

    updateQuoteAmountFromPercentage(quoteAmount: string) {
      this.inputQuoteAmount = quoteAmount

      this.$emit('update:quote-amount', quoteAmount)
    },

    updateHasAdvancedSettingsErrors(hasAdvancedSettingsErrors: boolean) {
      this.$emit('update:hasAdvancedSettingsErrors', hasAdvancedSettingsErrors)
    },

    updateProportionalPercentage(proportionalPercentage: number) {
      this.inputProportionalPercentage = proportionalPercentage

      this.$emit('update:proportionalPercentage', proportionalPercentage)
      this.$emit('update:averagePriceOption', AveragePriceOptions.Percentage)

      this.setShouldPotentiallyShowPercentageWarning()
    },

    setShouldPotentiallyShowPercentageWarning() {
      this.potentiallyShowPercentageWarning = true

      setTimeout(() => {
        this.potentiallyShowPercentageWarning = false
      }, 5000)
    },

    setPostOnly(postOnly: boolean) {
      this.inputPostOnly = postOnly

      this.$emit('update:postOnly', postOnly)

      this.updateInputsOnPostOnlyToggle()
    },

    updateInputsOnPostOnlyToggle() {
      const {
        averagePriceOption,
        reduceOnly,
        tradingTypeMarket,
        orderTypeBuy,
        isSpot
      } = this

      if (!tradingTypeMarket) {
        if (!isSpot && averagePriceOption !== AveragePriceOptions.Percentage) {
          return
        }

        if (isSpot && averagePriceOption !== AveragePriceOptions.Percentage) {
          orderTypeBuy
            ? this.updateSpotBaseAmountFromQuote()
            : this.updateSpotQuoteAmountFromBase()
          return
        }

        if (
          averagePriceOption === AveragePriceOptions.Percentage &&
          !reduceOnly
        ) {
          this.$percentageOptions.updateBaseAndQuoteAmountFromPercentage()
        }
      }
    },

    onLeverageChange(leverage: string) {
      const { maxLeverageAvailable } = this

      const leverageToBigNumber = new BigNumberInBase(leverage)

      if (leverageToBigNumber.gte(maxLeverageAvailable)) {
        this.inputLeverage = maxLeverageAvailable.toFixed()

        return this.$emit('update:leverage', maxLeverageAvailable.toFixed())
      }

      if (leverageToBigNumber.lt(1)) {
        this.inputLeverage = '1'

        return this.$emit('update:leverage', '1')
      }

      this.inputLeverage = leverage

      return this.$emit('update:leverage', leverage)
    },

    setSlippageTolerance(slippage: string) {
      this.inputSlippageTolerance = formatAmountToAllowableDecimals(slippage, 2)

      this.$emit('update:slippageTolerance', slippage)
    },

    setReduceOnly(reduceOnly: boolean) {
      this.inputReduceOnly = reduceOnly

      this.$emit('update:reduceOnly', reduceOnly)

      if (reduceOnly) {
        this.onLeverageChange('1') // set the leverage to 1 if the reduce only is set
      }
    },

    onPriceChange(price: string = '') {
      const {
        hasAmount,
        market,
        isSpot,
        averagePriceOption,
        inputTriggerPrice,
        tradingTypeStopLimit
      } = this

      if (!market) {
        return
      }

      const triggerPriceToBigNumber = new BigNumberInBase(inputTriggerPrice)
      const formattedPrice = formatPriceToAllowableDecimals(
        price,
        market.priceDecimals
      )

      this.inputPrice = formattedPrice
      this.$emit('update:price', formattedPrice)

      if (hasAmount && averagePriceOption === AveragePriceOptions.Percentage) {
        this.$percentageOptions.updateBaseAmountBasedOnPercentage()
        this.$percentageOptions.updateQuoteAmountBasedOnPercentage()
        return
      }

      if (hasAmount && averagePriceOption === AveragePriceOptions.BaseAmount) {
        if (tradingTypeStopLimit && triggerPriceToBigNumber.lte(0)) {
          return
        }

        return isSpot
          ? this.updateSpotQuoteAmountFromBase()
          : this.updateDerivativesQuoteAmountFromBase()
      }

      if (hasAmount && averagePriceOption === AveragePriceOptions.QuoteAmount) {
        return isSpot
          ? this.updateSpotBaseAmountFromQuote()
          : this.updateDerivativesBaseAmountFromQuote()
      }
    },

    onTriggerPriceChange(triggerPrice: string = '') {
      const { averagePriceOption, hasAmount, market } = this

      if (!market) {
        return
      }

      const triggerPriceToBigNumber = new BigNumberInBase(triggerPrice)
      const formattedTriggerPrice = formatPriceToAllowableDecimals(
        triggerPrice,
        market.priceDecimals
      )

      this.inputTriggerPrice = formattedTriggerPrice
      this.$emit('update:trigger-price', formattedTriggerPrice)

      if (hasAmount && averagePriceOption === AveragePriceOptions.Percentage) {
        this.$percentageOptions.updateBaseAmountBasedOnPercentage()
        this.$percentageOptions.updateQuoteAmountBasedOnPercentage()
        return
      }

      if (
        hasAmount &&
        averagePriceOption === AveragePriceOptions.BaseAmount &&
        triggerPriceToBigNumber.gt(0)
      ) {
        this.updateDerivativesQuoteAmountFromBase()
      }

      if (hasAmount && averagePriceOption === AveragePriceOptions.QuoteAmount) {
        this.updateDerivativesBaseAmountFromQuote()
      }
    },

    onAmountChange(amount: string = '') {
      const { hasPrice, market, isSpot, tradingTypeMarket, inputTriggerPrice } =
        this

      if (!market) {
        return
      }

      this.$emit('update:averagePriceOption', AveragePriceOptions.BaseAmount)

      const triggerPriceToBigNumber = new BigNumberInBase(inputTriggerPrice)
      const formattedBaseAmount = formatAmountToAllowableDecimals(
        amount,
        market.quantityDecimals
      )

      this.inputBaseAmount = formattedBaseAmount
      this.$emit('update:amount', formattedBaseAmount)

      this.$emit('update:proportionalPercentage', 0)

      if (isSpot) {
        this.updateSpotQuoteAmountFromBase()
      }

      if (!this.tradingTypeStopLimit || triggerPriceToBigNumber.gt(0)) {
        this.updateDerivativesQuoteAmountFromBase()
      }

      if (
        !hasPrice &&
        !tradingTypeMarket &&
        !this.checkIfPriceInputFieldIsActive()
      ) {
        this.updatePriceFromLastTradedPrice()
      }
    },

    onQuoteAmountChange(quoteAmount: string = '') {
      const { hasPrice, market, tradingTypeMarket, isSpot } = this

      if (!market) {
        return
      }

      this.$emit('update:averagePriceOption', AveragePriceOptions.QuoteAmount)

      const formattedQuoteAmount = formatAmountToAllowableDecimals(
        quoteAmount,
        market.priceDecimals
      )

      this.inputQuoteAmount = formattedQuoteAmount
      this.$emit('update:quote-amount', formattedQuoteAmount)
      this.$emit('update:proportionalPercentage', 0)

      if (
        !hasPrice &&
        !tradingTypeMarket &&
        !this.checkIfPriceInputFieldIsActive()
      ) {
        this.updatePriceFromLastTradedPrice()
      }

      if (isSpot) {
        this.updateSpotBaseAmountFromQuote()
      } else {
        return this.updateDerivativesBaseAmountFromQuote()
      }
    },

    updateSpotBaseAmountFromQuote() {
      const {
        inputQuoteAmountToBigNumber,
        executionPrice,
        market,
        orderTypeBuy,
        makerFeeRate,
        takerFeeRate,
        inputPostOnly,
        tradingTypeMarket
      } = this

      if (!market) {
        return
      }

      const feeRate =
        !tradingTypeMarket && inputPostOnly ? makerFeeRate : takerFeeRate

      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)

      const baseAmount = inputQuoteAmountToBigNumber.div(
        executionPrice.times(feeMultiplier)
      )

      if (baseAmount.gt(0) && baseAmount.isFinite()) {
        const formattedBaseAmount = baseAmount.toFixed(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )

        this.inputBaseAmount = formattedBaseAmount
        this.$emit('update:amount', formattedBaseAmount)
      } else {
        // updates inputBaseAmount also if a tradingType changes
        this.inputBaseAmount = this.amountStep
        this.$emit('update:amount', this.amountStep)
      }
    },

    updateDerivativesBaseAmountFromQuote() {
      const {
        inputQuoteAmountToBigNumber,
        executionPrice,
        market,
        tradingTypeStopMarket,
        triggerPrice
      } = this

      if (!market) {
        return
      }

      const price = tradingTypeStopMarket ? triggerPrice : executionPrice
      const baseAmount = inputQuoteAmountToBigNumber.div(price)

      if (baseAmount.gt(0)) {
        const formattedBaseAmount = baseAmount.toFixed(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )

        this.inputBaseAmount = formattedBaseAmount

        this.$emit('update:amount', formattedBaseAmount)
      } else {
        // updates inputBaseAmount also if a tradingType changes
        this.inputBaseAmount = this.amountStep
        this.$emit('update:amount', this.amountStep)
      }
    },

    updateSpotQuoteAmountFromBase() {
      const {
        averagePrice,
        inputBaseAmountToBigNumber,
        inputPostOnly,
        inputPrice,
        makerFeeRate,
        market,
        orderTypeBuy,
        takerFeeRate,
        tradingTypeMarket
      } = this

      if (!market) {
        return
      }

      const feeRate =
        !tradingTypeMarket && inputPostOnly ? makerFeeRate : takerFeeRate

      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)

      // calculate executionPrice here because executionPrice computed property not updating in time
      const executionPrice = tradingTypeMarket ? averagePrice : inputPrice
      const quoteAmount = inputBaseAmountToBigNumber
        .times(executionPrice)
        .times(feeMultiplier)

      if (quoteAmount.gt(0)) {
        const formattedQuoteAmount = formatAmountToAllowableDecimals(
          quoteAmount.toNumber(),
          market.priceDecimals
        )

        this.inputQuoteAmount = formattedQuoteAmount
        this.$emit('update:quote-amount', formattedQuoteAmount)
      } else {
        this.inputQuoteAmount = ''

        this.$emit('update:quote-amount', '')
      }
    },

    updateDerivativesQuoteAmountFromBase() {
      const {
        inputBaseAmountToBigNumber,
        averagePrice,
        inputPrice,
        market,
        triggerPrice,
        tradingTypeMarket,
        tradingTypeStopMarket
      } = this

      if (!market) {
        return
      }
      console.log('trying to update quote amount from base')
      // calculate executionPrice here because executionPrice computed property not updating in time
      const executionPrice = tradingTypeMarket ? averagePrice : inputPrice
      const price = tradingTypeStopMarket ? triggerPrice : executionPrice
      const quoteAmount = inputBaseAmountToBigNumber.times(price)

      if (quoteAmount.gt('0')) {
        const formattedQuoteAmount = quoteAmount.toFixed(
          market.priceDecimals,
          BigNumberInBase.ROUND_DOWN
        )

        this.inputQuoteAmount = formattedQuoteAmount

        this.$emit('update:quote-amount', formattedQuoteAmount)
      } else {
        this.inputQuoteAmount = ''

        this.$emit('update:quote-amount', '')
      }
    },

    checkIfPriceInputFieldIsActive(): boolean {
      const priceInput = document.getElementById('input-price')
      const priceInputId = priceInput ? priceInput.id : ''
      const activeElement = document.activeElement
      const activeElementId = activeElement ? activeElement.id : ''

      return priceInputId === activeElementId
    },

    updatePriceFromLastTradedPrice() {
      this.$emit('update:priceFromLastTradedPrice')
    },

    updateHasInputErrors(hasInputErrors: boolean) {
      this.$emit('update:hasInputErrors', hasInputErrors)
    },

    reset(): void {
      this.setPostOnly(false)
      this.setReduceOnly(false)
      this.setSlippageTolerance('0.5')
      this.onPriceChange(this.lastTradedPrice.toString())
      this.onTriggerPriceChange('')
      this.onAmountChange(this.amountStep)
      this.onLeverageChange('1')
    }
  }
})
</script>
