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
        <p class="text-sm">
          If the mark price drops to or below 30,250.0 USDT, a limit order to
          buy 0.0001 BTC at a price of 30,223.0 USDT will be placed.
        </p>
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

    orderTypeBuy(): boolean {
      const { orderType } = this

      return [
        SpotOrderSide.TakeBuy,
        SpotOrderSide.StopBuy,
        DerivativeOrderSide.TakeBuy,
        DerivativeOrderSide.StopBuy
      ].includes(orderType)
    },

    tradingType(): TradeExecutionType {
      return this.$accessor.modal.data?.tradingType
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.OrderConfirm]
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
      const { orderType, tradingTypeMarket } = this

      const suffix = tradingTypeMarket
        ? this.$t('trade.market')
        : this.$t('trade.limit')

      switch (orderType) {
        case SpotOrderSide.TakeBuy:
        case DerivativeOrderSide.TakeBuy:
        case SpotOrderSide.TakeSell:
        case DerivativeOrderSide.TakeSell:
          return [this.$t('trade.takeProfit'), suffix].join(' ')
        case SpotOrderSide.StopBuy:
        case DerivativeOrderSide.StopBuy:
        case SpotOrderSide.StopSell:
        case DerivativeOrderSide.StopSell:
          return [this.$t('trade.stopLoss'), suffix].join(' ')
        default:
          return ''
      }
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

    toggleDoNotShow() {}
  }
})
</script>
