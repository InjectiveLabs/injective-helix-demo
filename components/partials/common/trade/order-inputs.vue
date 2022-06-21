<template>
  <div>
    <VInput
      v-if="!tradingTypeMarket"
      ref="input-price"
      :value="inputPrice"
      :placeholder="priceStep"
      :label="$t('trade.price')"
      :disabled="tradingTypeMarket"
      type="number"
      :step="priceStep"
      :max-decimals="market ? market.quoteToken.decimals : 6"
      min="0"
      data-cy="trading-page-price-input"
      @input="onPriceChange"
    >
      <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
    </VInput>

    <div class="flex gap-3 mt-6">
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
        data-cy="trading-page-amount-input"
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
        ref="input-quote-amount"
        v-model="inputQuoteAmount"
        :custom-handler="true"
        :max-decimals="market ? market.priceDecimals : 6"
        :placeholder="amountStep"
        type="number"
        :step="amountStep"
        min="0"
        data-cy="trading-page-amount-input"
        show-prefix
        show-addon
        @input="onQuoteAmountChange"
      >
        <span slot="prefix">≈</span>
        <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>

        <PercentAmountOptions
          slot="context"
          v-bind="{
            quoteAvailableBalance,
            sells,
            takerFeeRate,
            market,
            hasPrice,
            buys,
            sells,
            orderTypeBuy,
            baseAvailableBalance,
            executionPrice,
            feeRate
          }"
          ref="percentageOptions"
          :proportional-percentage="inputProportionalPercentage"
          @update-proportional-percentage="updateProportionalPercentage"
          @update-quote-amount-from-percentage="updateQuoteAmountFromPercentage"
          @update-base-amount-from-percentage="updateBaseAmountFromPercentage"
          @update-price-from-last-traded-price="updatePriceFromLastTradedPrice"
        />
      </VInput>
    </div>

    <InputError
      v-bind="{
        hasInputErrors,
        market,
        price: priceToBigNumber,
        executionPrice,
        lastTradedPrice,
        quoteAmount: inputQuoteAmountToBigNumber,
        hasQuoteAmount,
        quoteAvailableBalance,
        baseAvailableBalance,
        totalWithFees,
        amount: inputAmountToBigNumber,
        hasAmount,
        orderTypeBuy,
        tradingTypeMarket,
        sells,
        buys,
        hasPrice
      }"
      @update-has-input-errors="updateHasInputErrors"
    />

    <AdvancedSettings
      :trading-type-market="tradingTypeMarket"
      :slippage-tolerance="inputSlippageTolerance"
      :post-only="inputPostOnly"
      :has-advanced-settings-errors="hasAdvancedSettingsErrors"
      @set-slippage-tolerance="setSlippageTolerance"
      @set-post-only="setPostOnly"
      @update-has-advanced-settings-errors="updateHasAdvancedSettingsErrors"
    />
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  UiPriceLevel,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import {
  calculateAverageExecutionPriceFromFillableNotionalOnOrderBook,
  calculateAverageExecutionPriceFromOrderbook
} from '~/app/client/utils/spot'
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
    AdvancedSettings
  },

  props: {
    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    tradingType: {
      type: String as PropType<TradeExecutionType>,
      required: true
    },

    price: {
      type: String,
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

    amountStep: {
      type: String,
      required: true
    },

    lastTradedPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    market: {
      type: Object as PropType<UiSpotMarketWithToken>,
      required: true
    },

    baseAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
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

    feeRate: {
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

    // executionPrice: {
    //   type: Object as PropType<BigNumberInBase>,
    //   required: true
    // },

    hasInputErrors: {
      type: Boolean,
      required: true
    },

    totalWithFees: {
      type: Object as PropType<BigNumberInBase>,
      required: true
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
      type: Object as PropType<AveragePriceOptions>,
      required: true
    }
  },

  data() {
    return {
      inputBaseAmount: '',
      inputQuoteAmount: '',
      inputPrice: '',
      inputPostOnly: false,
      inputProportionalPercentage: 0,
      inputSlippageTolerance: '0.5'
    }
  },

  computed: {
    $percentageOptions(): any {
      return this.$refs.percentageOptions
    },

    inputQuoteAmountToBigNumber(): BigNumberInBase {
      const { inputQuoteAmount } = this

      return new BigNumberInBase(inputQuoteAmount)
    },

    inputAmountToBigNumber(): BigNumberInBase {
      const { inputBaseAmount } = this

      return new BigNumberInBase(inputBaseAmount)
    },

    priceToBigNumber(): BigNumberInBase {
      const { price } = this

      return new BigNumberInBase(price)
    },

    hasQuoteAmount(): boolean {
      const { inputQuoteAmountToBigNumber, priceStep } = this

      return (
        !inputQuoteAmountToBigNumber.isNaN() &&
        inputQuoteAmountToBigNumber.gt(0) &&
        inputQuoteAmountToBigNumber.gte(priceStep)
      )
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

    averagePriceDerivedFromBaseAmount(): BigNumberInBase {
      const {
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        amount,
        averagePriceOption,
        baseAvailableBalance,
        proportionalPercentage
      } = this

      if (!market || !hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const percentBaseBalance = baseAvailableBalance.times(
        proportionalPercentage
      )

      const baseAmountForAveragePrice =
        averagePriceOption === AveragePriceOptions.BaseAmount
          ? new BigNumberInBase(amount)
          : percentBaseBalance
      console.log('bout to run legit calc')

      return calculateAverageExecutionPriceFromOrderbook({
        records,
        amount: baseAmountForAveragePrice,
        market
      })
    },

    averagePriceDerivedFromQuoteAmount(): BigNumberInBase {
      const {
        orderTypeBuy,
        sells,
        buys,
        market,
        quoteAmount,
        averagePriceOption,
        quoteAvailableBalance,
        proportionalPercentage
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const percentQuoteBalance = quoteAvailableBalance.times(
        proportionalPercentage
      )

      const quoteAmountForAveragePrice =
        averagePriceOption === AveragePriceOptions.QuoteAmount
          ? new BigNumberInBase(quoteAmount)
          : percentQuoteBalance

      const averagePrice =
        calculateAverageExecutionPriceFromFillableNotionalOnOrderBook({
          records,
          quoteAmount: quoteAmountForAveragePrice,
          market
        })

      if (averagePrice.isNaN()) {
        return ZERO_IN_BASE
      }

      return averagePrice
    },

    averagePrice(): BigNumberInBase {
      const {
        averagePriceDerivedFromBaseAmount,
        averagePriceDerivedFromQuoteAmount,
        averagePriceOption,
        orderTypeBuy
      } = this
      console.log('trying avg price')

      if (averagePriceOption === AveragePriceOptions.BaseAmount) {
        console.log('doing avg price base amoutn calc')
        return averagePriceDerivedFromBaseAmount
      }

      if (averagePriceOption === AveragePriceOptions.QuoteAmount) {
        return averagePriceDerivedFromQuoteAmount
      }

      if (averagePriceOption === AveragePriceOptions.Percentage) {
        if (orderTypeBuy) {
          return averagePriceDerivedFromQuoteAmount
        }

        return averagePriceDerivedFromBaseAmount
      }

      return ZERO_IN_BASE
    },

    executionPrice(): BigNumberInBase {
      const { tradingTypeMarket, averagePrice, price } = this
      console.log('calculating')
      if (tradingTypeMarket) {
        if (averagePrice.isNaN()) {
          return ZERO_IN_BASE
        }

        return averagePrice
      }

      return new BigNumberInBase(price)
    }
  },

  watch: {
    lastTradedPrice(newPrice: BigNumberInBase) {
      const { price, market } = this
      if (!market) {
        return
      }
      if (!price) {
        const formattedPrice = newPrice.toFixed(market.priceDecimals)
        this.inputPrice = formattedPrice
        this.$emit('update:price', formattedPrice)
      }
    },

    orderType() {
      const { tradingType, inputPrice, market } = this

      if (tradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(inputPrice)
      }
    },

    tradingType(newTradingType: TradeExecutionType) {
      const { inputPrice, market } = this

      if (newTradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(inputPrice)
      }
    }
  },

  methods: {
    getAveragePriceForBase() {
      const {
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        amount,
        averagePriceOption,
        baseAvailableBalance,
        proportionalPercentage
      } = this

      if (!market || !hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const percentBaseBalance = baseAvailableBalance.times(
        proportionalPercentage
      )

      const baseAmountForAveragePrice =
        averagePriceOption === AveragePriceOptions.BaseAmount
          ? new BigNumberInBase(amount)
          : percentBaseBalance
      console.log('bout to run legit calc')

      return calculateAverageExecutionPriceFromOrderbook({
        records,
        amount: baseAmountForAveragePrice,
        market
      })
    },

    updateBaseAmountFromPercentage(amount: string) {
      this.inputBaseAmount = amount
      this.$emit('update:amount', amount)
    },

    updateQuoteAmountFromPercentage(quoteAmount: string) {
      this.inputQuoteAmount = quoteAmount
      this.$emit('update:quote-amount', quoteAmount)
    },

    updateHasAdvancedSettingsErrors(hasAdvancedSettingsErrors: boolean) {
      this.$emit(
        'update:has-advanced-settings-errors',
        hasAdvancedSettingsErrors
      )
    },

    updateProportionalPercentage(proportionalPercentage: number) {
      this.inputProportionalPercentage = proportionalPercentage
      this.$emit('update:proportional-percentage', proportionalPercentage)

      this.$emit('update:average-price-option', AveragePriceOptions.Percentage)
    },

    setPostOnly(postOnly: boolean) {
      const { inputProportionalPercentage } = this

      this.inputPostOnly = postOnly
      this.$emit('update:post-only', postOnly)

      if (new BigNumberInBase(inputProportionalPercentage).isZero()) {
        this.updateBaseAmountFromQuote()
      } else {
        this.$percentageOptions.updateBaseAndQuoteAmountFromPercentage()
      }
    },

    setSlippageTolerance(slippage: string) {
      this.inputSlippageTolerance = formatAmountToAllowableDecimals(slippage, 2)
      this.$emit('upinputPostOnly-tolerance', slippage)
    },

    onPriceChange(price: string = '') {
      const { hasAmount, market } = this

      if (!market) {
        return
      }

      const formattedPrice = formatPriceToAllowableDecimals(
        price,
        market.priceDecimals
      )

      this.inputPrice = formattedPrice
      this.$emit('update:price', formattedPrice)

      if (hasAmount) {
        this.updateQuoteAmountFromBase()
      }
    },

    onAmountChange(amount: string = '') {
      const { hasPrice, market } = this

      console.log('just clicked')

      if (!market) {
        return
      }

      this.$emit('update:average-price-option', AveragePriceOptions.BaseAmount)

      const formattedBaseAmount = formatAmountToAllowableDecimals(
        amount,
        market.quantityDecimals
      )
      console.log('about to set local base amount', formattedBaseAmount)
      this.inputBaseAmount = formattedBaseAmount
      this.$emit('update:amount', formattedBaseAmount)
      console.log('just set baseAmount', formattedBaseAmount)
      this.$emit('update:proportionalPercentage', 0)

      if (!hasPrice) {
        this.updatePriceFromLastTradedPrice()
      }

      this.updateQuoteAmountFromBase()
    },

    onQuoteAmountChange(quoteAmount: string = '') {
      const { hasPrice, market } = this

      if (!market) {
        return
      }

      this.$emit('update:average-price-option', AveragePriceOptions.QuoteAmount)

      const formattedQuoteAmount = formatAmountToAllowableDecimals(
        quoteAmount,
        market.priceDecimals
      )

      this.inputQuoteAmount = formattedQuoteAmount
      this.$emit('update:quoteAmount', formattedQuoteAmount)

      // todo: see if htis is necesary
      // this.resetBaseAmount()

      this.$emit('update:proportionalPercentage', 0)

      if (!hasPrice) {
        this.updatePriceFromLastTradedPrice()
      }

      this.updateBaseAmountFromQuote()
    },

    updateBaseAmountFromQuote() {
      const {
        inputQuoteAmount,
        executionPrice,
        market,
        orderTypeBuy,
        feeRate
      } = this

      if (!market) {
        return
      }

      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)

      const baseAmount = new BigNumberInBase(inputQuoteAmount)
        .div(executionPrice.times(feeMultiplier))
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)

      this.inputBaseAmount = baseAmount
      this.$emit('update:amount', baseAmount)
    },

    updateQuoteAmountFromBase() {
      const {
        inputAmountToBigNumber,
        executionPrice,
        market,
        feeRate,
        orderTypeBuy
      } = this

      if (!market) {
        return
      }
      console.log('about to calculate quote amount')
      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)
      // console.log(
      //   inputAmountToBigNumber.toFixed(),
      //   executionPrice.toFixed(),
      //   feeMultiplier.toFixed()
      // )
      console.log('average price', this.getAveragePriceForBase())
      const quoteAmount = inputAmountToBigNumber
        .times(this.getAveragePriceForBase())
        .times(feeMultiplier)
      console.log('badazz quote amount', quoteAmount)

      const formattedQuoteAmount = formatAmountToAllowableDecimals(
        quoteAmount.toNumber(),
        market.priceDecimals
      )

      console.log('badazz formattedQuoteAmoutn', formattedQuoteAmount)

      console.log('about to set quoteAmount', formattedQuoteAmount)

      this.inputQuoteAmount = formattedQuoteAmount
      console.log('setting inputQuoteAmoutn', this.inputQuoteAmount)
      this.$emit('update:quote-amount', formattedQuoteAmount)
    },

    updatePriceFromLastTradedPrice() {
      this.$emit('update-price-from-last-traded-price')
    },

    updateHasInputErrors(hasInputErrors: boolean) {
      this.$emit('update:has-input-errors', hasInputErrors)
    }
  }
})
</script>
