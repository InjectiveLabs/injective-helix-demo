<template>
  <div>
    <VInput
      v-if="!tradingTypeMarket"
      ref="input-price"
      :value="price"
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
        v-model="localBaseAmount"
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
        v-model="localQuoteAmount"
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
          :quote-amount.sync="quoteAmount"
          :proportional-percentage.sync="proportionalPercentage"
          :amount.sync="amount"
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
        quoteAmount: localQuoteAmountToBigNumber,
        hasQuoteAmount,
        quoteAvailableBalance,
        baseAvailableBalance,
        totalWithFees,
        amount: localAmountToBigNumber,
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
      :slippage-tolerance="form.slippageTolerance"
      :trading-type-market="tradingTypeMarket"
      :post-only="form.postOnly"
      :has-advanced-settings-errors.sync="hasAdvancedSettingsErrors"
      @set-slippage-tolerance="setSlippageTolerance"
      @set-post-only="setPostOnly"
    />
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiSpotMarketWithToken, UiPriceLevel } from '@injectivelabs/sdk-ui-ts'
import PercentAmountOptions from '~/components/partials/common/trade/percent-amount-options.vue'
import InputError from '~/components/partials/common/trade/input-error.vue'
import AdvancedSettings from '~/components/partials/common/trade/advanced-settings/index.vue'
import {
  formatPriceToAllowableDecimals,
  formatAmountToAllowableDecimals
} from '~/app/utils/formatters'

interface PercentageOptionsRef extends Vue {
  updateBaseAndQuoteAmountFromPercentage(): void
}

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

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

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
    }
  },

  data() {
    return {
      localBaseAmount: '',
      localQuoteAmount: ''
    }
  },

  computed: {
    $percentageOptions(): PercentageOptionsRef {
      return this.$refs.percentageOptions
    },

    localQuoteAmountToBigNumber(): BigNumberInBase {
      const { localQuoteAmount } = this

      return new BigNumberInBase(localQuoteAmount)
    },

    localAmountToBigNumber(): BigNumberInBase {
      const { localBaseAmount } = this

      return new BigNumberInBase(localBaseAmount)
    },

    priceToBigNumber(): BigNumberInBase {
      const { price } = this

      return new BigNumberInBase(price)
    },

    hasQuoteAmount(): boolean {
      const { localQuoteAmountToBigNumber, priceStep } = this

      return (
        !localQuoteAmountToBigNumber.isNaN() &&
        localQuoteAmountToBigNumber.gt(0) &&
        localQuoteAmountToBigNumber.gte(priceStep)
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
    }
  },

  methods: {
    setPostOnly(postOnly: boolean) {
      const {
        form: { proportionalPercentage }
      } = this

      this.localPostOnly = postOnly

      if (new BigNumberInBase(proportionalPercentage).isZero()) {
        this.updateBaseAmountFromQuote()
      } else {
        this.updateBaseAndQuoteAmountFromPercentage()
      }
    },

    onPriceChange(price: string = '') {
      const { hasAmount, market } = this

      if (!market) {
        return
      }

      this.$emit(
        'update:price',
        formatPriceToAllowableDecimals(price, market.priceDecimals)
      )

      if (hasAmount) {
        this.updateQuoteAmountFromBase()
      }
    },

    onAmountChange(amount: string = '') {
      const { hasPrice, market } = this

      if (!market) {
        return
      }

      const formattedBaseAmount = formatAmountToAllowableDecimals(
        amount,
        market.quantityDecimals
      )

      this.localBaseAmount = formattedBaseAmount
      this.$emit('update:amount', formattedBaseAmount)

      // todo: validate reset quote amount is necessary
      // this.resetQuoteAmount()

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

      const formattedQuoteAmount = formatAmountToAllowableDecimals(
        quoteAmount,
        market.priceDecimals
      )

      this.localQuoteAmount = formattedQuoteAmount
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
        localQuoteAmount,
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

      const baseAmount = new BigNumberInBase(localQuoteAmount)
        .div(executionPrice.times(feeMultiplier))
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)

      this.localBaseAmount = baseAmount
      this.$emit('update:amount', baseAmount)
    },

    updateQuoteAmountFromBase() {
      const {
        localAmountToBigNumber,
        executionPrice,
        market,
        feeRate,
        orderTypeBuy
      } = this

      if (!market) {
        return
      }

      const feeMultiplier = orderTypeBuy
        ? new BigNumberInBase(1).plus(feeRate)
        : new BigNumberInBase(1).minus(feeRate)

      const quoteAmount = localAmountToBigNumber
        .times(executionPrice)
        .times(feeMultiplier)

      const formattedQuoteAmount = formatAmountToAllowableDecimals(
        quoteAmount.toNumber(),
        market.priceDecimals
      )

      this.localQuoteAmount = formattedQuoteAmount
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
