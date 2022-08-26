<template>
  <VModal
    :is-open="isModalOpen"
    data-cy="price-deviation-modal"
    :sm="!!tradingType"
    @modal-closed="handleCloseModal"
  >
    <template v-if="!!tradingType">
      <h3 slot="title">
        <span
          class="normal-case"
          :class="{
            'text-green-500': orderTypeBuy,
            'text-red-500': !orderTypeBuy
          }"
        >
          {{ titlePrefix }}
        </span>
        <span class="normal-case font-semibold">{{ title }}</span>
      </h3>

      <div class="flex flex-col gap-6">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="text-sm" v-html="description" />
        <div class="flex justify-between items-center gap-6">
          <VButton
            md
            primary
            class="rounded w-full"
            data-cy="confirm-order-modal-confirm-button"
            @click.stop="handleConfirm"
          >
            {{ $t('common.confirm') }}
          </VButton>
          <VButton
            md
            outline
            class="rounded w-full"
            data-cy="confirm-order-modal-confirm-button"
            @click.stop="handleCancel"
          >
            {{ $t('common.cancel') }}
          </VButton>
        </div>
        <div>
          <VCheckbox
            :value="false"
            data-cy="confirm-order-modal-do-not-show-toggle"
            @input="toggleDoNotShow"
          >
            <slot class="text-xs">Do not show this confirmation again</slot>
          </VCheckbox>
        </div>
      </div>
    </template>

    <template v-else>
      <h3 slot="title">
        {{ $t('trade.confirmOrderExecution') }}
      </h3>

      <div class="relative">
        <p>
          {{
            $t('trade.high_execution_price_deviation_warning_note', {
              percentage: DEFAULT_PRICE_WARNING_DEVIATION
            })
          }}
        </p>
        <div class="mt-6 flex items-center justify-center">
          <VButton
            lg
            class="mr-4 rounded"
            primary
            data-cy="price-deviation-modal-confirm-button"
            @click.stop="handleConfirm"
          >
            {{ $t('common.confirm') }}
          </VButton>
          <VButton lg class="mr-4 rounded" red @click.stop="handleCancel">
            {{ $t('common.cancel') }}
          </VButton>
        </div>
      </div>
    </template>
  </VModal>
</template>

<script lang="ts">
import Vue from 'vue'
import { SpotOrderSide, DerivativeOrderSide } from '@injectivelabs/sdk-ts'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import { DEFAULT_PRICE_WARNING_DEVIATION } from '~/app/utils/constants'
import { Modal } from '~/types'
import { localStorage } from '~/app/Services'
import { BigNumberInBase } from '~/../injective-ts/packages/utils/dist'

export default Vue.extend({
  data() {
    return {
      DEFAULT_PRICE_WARNING_DEVIATION
    }
  },

  computed: {
    orderType(): SpotOrderSide | DerivativeOrderSide {
      return this.$accessor.modal.data?.orderType
    },

    tradingType(): TradeExecutionType {
      return this.$accessor.modal.data?.tradingType
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.OrderConfirm]
    },

    isReduceOnly(): boolean {
      return this.$accessor.modal.data?.isReduceOnly
    },

    amount(): BigNumberInBase {
      return this.$accessor.modal.data?.amount
    },

    amountSymbol(): string {
      return this.$accessor.modal.data?.amountSymbol
    },

    price(): BigNumberInBase {
      return this.$accessor.modal.data?.price
    },

    priceSymbol(): string {
      return this.$accessor.modal.data?.priceSymbol
    },

    triggerPrice(): BigNumberInBase {
      return this.$accessor.modal.data?.triggerPrice
    },

    triggerPriceSymbol(): string {
      return this.$accessor.modal.data?.triggerPriceSymbol
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return [
        SpotOrderSide.TakeBuy,
        SpotOrderSide.StopBuy,
        DerivativeOrderSide.TakeBuy,
        DerivativeOrderSide.StopBuy
      ].includes(orderType)
    },

    orderTypeTakeProfit(): boolean {
      const { orderType } = this

      return [
        SpotOrderSide.TakeBuy,
        DerivativeOrderSide.TakeBuy,
        SpotOrderSide.TakeSell,
        DerivativeOrderSide.TakeSell
      ].includes(orderType)
    },

    orderTypeStopLoss(): boolean {
      const { orderType } = this

      return [
        SpotOrderSide.StopBuy,
        DerivativeOrderSide.StopBuy,
        SpotOrderSide.StopSell,
        DerivativeOrderSide.StopSell
      ].includes(orderType)
    },

    titlePrefix(): string {
      const { orderTypeBuy } = this

      return orderTypeBuy ? this.$t('trade.buy') : this.$t('trade.sell')
    },

    tradingTypeMarket(): boolean {
      return (
        this.tradingType.toString() === 'stopMarket' ||
        this.tradingType === 'market'
      )
    },

    title(): string {
      const { orderTypeTakeProfit, orderTypeStopLoss, tradingTypeMarket } = this

      const suffix = tradingTypeMarket
        ? this.$t('trade.market')
        : this.$t('trade.limit')

      if (orderTypeTakeProfit) {
        return [this.$t('trade.takeProfit'), suffix].join(' ')
      }

      if (orderTypeStopLoss) {
        return [this.$t('trade.stopLoss'), suffix].join(' ')
      }

      return ''
    },

    description(): string {
      const {
        orderTypeBuy,
        orderTypeTakeProfit,
        orderTypeStopLoss,
        tradingTypeMarket,
        price: priceInBase,
        priceSymbol,
        triggerPrice: triggerPriceInBase,
        triggerPriceSymbol,
        amount: amountInBase,
        amountSymbol,
        isReduceOnly
      } = this

      const orderType = orderTypeBuy ? 'buy' : 'sell'
      const tradingType = tradingTypeMarket && orderTypeBuy ? 'market' : 'limit'
      const markPriceIncrease =
        (orderTypeBuy && orderTypeStopLoss) ||
        (!orderTypeBuy && orderTypeTakeProfit)
      const verb = markPriceIncrease ? 'rises' : 'drops'
      const preposition = markPriceIncrease ? 'above' : 'below'
      const price = !tradingTypeMarket ? priceInBase.toFixed(1) : ''
      const triggerPrice = triggerPriceInBase.toFixed(1)
      const amount = amountInBase.toFixed(4)

      return this.$t(
        tradingTypeMarket
          ? 'trade.confirmOrderModal.descriptionMarket'
          : 'trade.confirmOrderModal.descriptionLimit',
        {
          verb,
          preposition,
          triggerPrice,
          triggerPriceSymbol,
          tradingType,
          orderType,
          amount,
          amountSymbol,
          price,
          priceSymbol,
          reduceOnly: isReduceOnly ? ' reduce-only ' : ' '
        }
      )
    }
  },

  methods: {
    handleCloseModal() {
      this.$accessor.modal.closeModal(Modal.OrderConfirm)
    },

    handleConfirm() {
      this.$emit('confirmed')
      this.handleCloseModal()
    },

    handleCancel() {
      this.handleCloseModal()
    },

    toggleDoNotShow() {
      localStorage.set('skipTradeConfirmationModal', true)
    }
  }
})
</script>
