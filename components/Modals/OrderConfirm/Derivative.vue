<script lang="ts" setup>
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { SharedUiDerivativeMarket } from '@shared/types'
import { Modal, TradeExecutionType } from '@/types'

const props = defineProps({
  isReduceOnly: Boolean,

  amount: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<SharedUiDerivativeMarket>,
    required: true
  },

  orderType: {
    type: String as PropType<OrderSide>,
    default: ''
  },

  price: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  },

  tradingType: {
    type: String as PropType<TradeExecutionType>,
    default: ''
  },

  triggerPrice: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  }
})

const emit = defineEmits<{
  'order:confirmed': []
}>()

const appStore = useAppStore()
const modalStore = useModalStore()
const { t } = useLang()

const isModalOpen = computed(() => modalStore.modals[Modal.OrderConfirm])

const orderTypeBuy = computed(() => {
  return [OrderSide.TakeBuy, OrderSide.StopBuy].includes(props.orderType)
})

const orderTypeTakeProfit = computed(() => {
  return [OrderSide.TakeBuy, OrderSide.TakeSell].includes(props.orderType)
})

const orderTypeStopLoss = computed(() => {
  return [OrderSide.StopBuy, OrderSide.StopSell].includes(props.orderType)
})

const tradingTypeMarket = computed(() => {
  return ['stopMarket', 'market'].includes(props.tradingType.trim())
})

const markPriceIncrease = computed(() => {
  return (
    (orderTypeBuy.value && orderTypeStopLoss.value) ||
    (!orderTypeBuy.value && orderTypeTakeProfit.value)
  )
})

const { valueToString: amountToFormat } = useBigNumberFormatter(
  computed(() => props.amount),
  {
    decimalPlaces: props.market.quantityDecimals
  }
)

const { valueToString: priceToFormat } = useBigNumberFormatter(
  computed(() => props.price),
  { decimalPlaces: props.market.priceDecimals }
)

const { valueToString: triggerPriceToFormat } = useBigNumberFormatter(
  computed(() => props.triggerPrice),
  {
    decimalPlaces: props.market.priceDecimals
  }
)

function closeModal() {
  modalStore.closeModal(Modal.OrderConfirm)
}

function onModalClose() {
  closeModal()
}

function confirm() {
  emit('order:confirmed')
  closeModal()
}

function handleSkipTradeConfirmationModal() {
  appStore.setUserState({
    ...appStore.userState,
    skipTradeConfirmationModal: true
  })
}
</script>

<template>
  <AppModal
    :is-open="isModalOpen"
    :is-sm="!!tradingType"
    data-cy="price-deviation-modal"
    @modal:closed="onModalClose"
  >
    <template #title>
      <h3 class="flex items-center justify-start gap-2">
        <span
          class="normal-case"
          :class="{
            'text-green-500': orderTypeBuy,
            'text-red-500': !orderTypeBuy
          }"
        >
          {{ $t(`${orderTypeBuy ? 'trade.buy' : 'trade.sell'}`) }}
        </span>

        <span v-if="orderTypeTakeProfit" class="normal-case font-semibold">
          {{ t('trade.takeProfit') }}
          {{ tradingTypeMarket ? t('trade.market') : t('trade.limit') }}
        </span>

        <span v-if="orderTypeStopLoss" class="normal-case font-semibold">
          {{ t('trade.stopLoss') }}
          {{ tradingTypeMarket ? t('trade.market') : t('trade.limit') }}
        </span>
      </h3>
    </template>

    <div class="flex flex-col gap-6">
      <i18n-t
        :keypath="
          tradingTypeMarket
            ? 'trade.confirmOrderModal.descriptionMarket'
            : 'trade.confirmOrderModal.descriptionLimit'
        "
        tag="p"
        class="text-sm"
      >
        <template #verb>
          <span v-if="markPriceIncrease">
            {{ t('trade.confirmOrderModal.rises') }}
          </span>

          <span v-else>
            {{ t('trade.confirmOrderModal.drops') }}
          </span>
        </template>

        <template #preposition>
          <span v-if="markPriceIncrease">
            {{ t('trade.confirmOrderModal.above') }}
          </span>

          <span v-else>
            {{ t('trade.confirmOrderModal.below') }}
          </span>
        </template>

        <template #triggerPrice>
          <b>{{ triggerPriceToFormat }}</b>
        </template>

        <template #triggerPriceSymbol>
          <b>{{ market.quoteToken.symbol }}</b>
        </template>

        <template v-if="isReduceOnly" #reduceOnly>
          {{ t('trade.reduce_only').toLowerCase() }}
        </template>

        <template #tradingType>
          <span v-if="tradingTypeMarket">
            {{ t('trade.market').toLowerCase() }}
          </span>

          <span v-else>
            {{ t('trade.limit').toLowerCase() }}
          </span>
        </template>

        <template #orderType>
          <span v-if="orderTypeBuy">
            {{ t('trade.buy').toLowerCase() }}
          </span>

          <span v-else>
            {{ t('trade.sell').toLowerCase() }}
          </span>
        </template>

        <template #amount>
          <b>{{ amountToFormat }}</b>
        </template>

        <template #amountSymbol>
          <b>{{ market.baseToken.symbol }}</b>
        </template>

        <template #price>
          <b>{{ priceToFormat }}</b>
        </template>

        <template #priceSymbol>
          <b>{{ market.quoteToken.symbol }}</b>
        </template>
      </i18n-t>

      <div class="flex justify-between items-center gap-6">
        <AppButton
          class="bg-blue-500 text-blue-900"
          data-cy="confirm-order-modal-confirm-button"
          @click="confirm"
        >
          {{ $t('common.confirm') }}
        </AppButton>

        <AppButton
          class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
          data-cy="confirm-order-modal-confirm-button"
          @click="closeModal"
        >
          {{ $t('common.cancel') }}
        </AppButton>
      </div>

      <div>
        <AppCheckbox
          :model-value="false"
          data-cy="confirm-order-modal-do-not-show-toggle"
          @input="handleSkipTradeConfirmationModal"
        >
          <slot class="text-xs">
            {{ $t('trade.confirmOrderModal.doNotShowThisConfirmationAgain') }}
          </slot>
        </AppCheckbox>
      </div>
    </div>
  </AppModal>
</template>
