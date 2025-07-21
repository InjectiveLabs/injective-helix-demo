<script setup lang="ts">
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE, DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { quantizeNumber } from '@/app/utils/helpers'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  Modal,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  TakeProfitStopLossFormField
} from '@/types'
import type { TakeProfitStopLossForm } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()

const { t } = useLang()
const { $onError } = useNuxtApp()
const { resetForm, validate, errors } = useForm<TakeProfitStopLossForm>()
const { markPrice } = useDerivativeLastPrice(computed(() => market.value))

const {
  liquidationPrice,
  price: entryPrice,
  markPriceNotScaled
} = useDerivativePosition(computed(() => props.position))

const { isMarkPriceThresholdError: isTpMarkPriceThresholdError } =
  useMarkPriceThresholdError({
    markPrice,
    isBuy: computed(() => isBuy.value),
    market: computed(() => market.value),
    price: computed(() => tpWorstPrice.value),
    triggerPrice: computed(() => tpTriggerPrice.value),
    quantity: computed(() => tpQuantizedQuantity.value),
    marginWithFee: computed(() => tpMarginWithFee.value),
    type: computed(() => DerivativeTradeTypes.StopMarket)
  })

const { isMarkPriceThresholdError: isSlMarkPriceThresholdError } =
  useMarkPriceThresholdError({
    markPrice,
    isBuy: computed(() => isBuy.value),
    market: computed(() => market.value),
    price: computed(() => slWorstPrice.value),
    triggerPrice: computed(() => slTriggerPrice.value),
    quantity: computed(() => slQuantizedQuantity.value),
    marginWithFee: computed(() => slMarginWithFee.value),
    type: computed(() => DerivativeTradeTypes.StopMarket)
  })

const props = withDefaults(defineProps<{ position: PositionV2 }>(), {})
const emit = defineEmits<{
  'on:close': []
}>()

const availableQuantity = ref('0')
const status = reactive(new Status(StatusType.Idle))
const cancelTpStatus = reactive(new Status(StatusType.Idle))
const cancelSlStatus = reactive(new Status(StatusType.Idle))

const isBuy = computed(() => props.position?.direction === TradeDirection.Long)

const market = computed(() =>
  derivativeStore.marketByIdOrSlug(props.position?.marketId)
)

const existingTpOrder = computed(() => {
  const orderType = isBuy.value ? OrderSide.TakeSell : OrderSide.TakeBuy

  return derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      order.orderType === orderType &&
      order.marketId === props.position.marketId &&
      order.subaccountId === props.position.subaccountId
  )
})

const existingSlOrder = computed(() => {
  const orderType = isBuy.value ? OrderSide.StopSell : OrderSide.StopBuy

  return derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      order.orderType === orderType &&
      order.marketId === props.position.marketId &&
      order.subaccountId === props.position.subaccountId
  )
})

const tpTriggerPrice = computed(
  () => tpOrderTriggerPrice.value || takeProfitValue.value || '0'
)

const slTriggerPrice = computed(
  () => slOrderTriggerPrice.value || stopLossValue.value || '0'
)

const tpOrderTriggerPrice = computed(() =>
  existingTpOrder.value?.triggerPrice
    ? sharedToBalanceInToken({
        value: existingTpOrder.value.triggerPrice,
        decimalPlaces:
          market.value?.quoteToken.decimals || DEFAULT_ASSET_DECIMALS
      })
    : undefined
)

const slOrderTriggerPrice = computed(() =>
  existingSlOrder.value?.triggerPrice
    ? sharedToBalanceInToken({
        value: existingSlOrder.value.triggerPrice,
        decimalPlaces:
          market.value?.quoteToken.decimals || DEFAULT_ASSET_DECIMALS
      })
    : undefined
)

const tpOrderQuantity = computed(() => existingTpOrder.value?.quantity)
const slOrderQuantity = computed(() => existingSlOrder.value?.quantity)

const {
  value: takeProfitValue,
  errorMessage: takeProfitErrorMessage,
  setValue: setTakeProfitValue
} = useStringField({
  name: TakeProfitStopLossFormField.TakeProfit,
  initialValue: '',
  rule: '',
  dynamicRule: computed(() => {
    const formattedMarkPriceNotScaled = markPriceNotScaled.value.toFixed(
      market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
    )

    if (isBuy.value) {
      return `minValue:${formattedMarkPriceNotScaled}`
    } else {
      return `maxValue:${formattedMarkPriceNotScaled}`
    }
  })
})

const {
  value: stopLossValue,
  errorMessage: stopLossErrorMessage,
  setValue: setStopLossValue
} = useStringField({
  name: TakeProfitStopLossFormField.StopLoss,
  initialValue: '',
  rule: '',
  dynamicRule: computed(() => {
    const formattedMarkPriceNotScaled = markPriceNotScaled.value.toFixed(
      market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
    )

    const formattedLiquidationPrice = liquidationPrice.value.toFixed(
      market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
    )

    if (isBuy.value) {
      const minValueRule = `minValue:${formattedLiquidationPrice}`
      const maxValueRule = `maxValue:${formattedMarkPriceNotScaled}`

      return [minValueRule, maxValueRule].join('|')
    } else {
      const minValueRule = `minValue:${formattedMarkPriceNotScaled}`
      const maxValueRule = `maxValue:${formattedLiquidationPrice}`

      return [minValueRule, maxValueRule].join('|')
    }
  })
})

const {
  valueToFixed: availableQuantityToFixed,
  valueToBigNumber: availableQuantityToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => new BigNumberInBase(availableQuantity.value)),
  {
    decimalPlaces: computed(
      () => market.value?.quantityDecimals || DEFAULT_ASSET_DECIMALS
    )
  }
)

const {
  value: tpQuantity,
  errorMessage: tpQuantityErrorMessage,
  setValue: setTpQuantity
} = useStringField({
  name: 'tpPositionQuantity',
  rule: '',
  dynamicRule: computed(
    () =>
      `nonZeroPositionQuantity|maxValuePositionQuantity:${availableQuantityToFixed.value}`
  )
})

const {
  value: slQuantity,
  errorMessage: slQuantityErrorMessage,
  setValue: setSlQuantity
} = useStringField({
  name: 'slPositionQuantity',
  rule: '',
  dynamicRule: computed(
    () =>
      `nonZeroPositionQuantity|maxValuePositionQuantity:${availableQuantityToFixed.value}`
  )
})

const tpQuantizedQuantity = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return quantizeNumber(
    new BigNumberInBase(tpQuantity.value || 0),
    market.value.quantityTensMultiplier
  )
})

const slQuantizedQuantity = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return quantizeNumber(
    new BigNumberInBase(slQuantity.value || 0),
    market.value.quantityTensMultiplier
  )
})

const tpWorstPrice = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return quantizeNumber(
    new BigNumberInBase(takeProfitValue.value || 0),
    market.value.priceTensMultiplier
  )
})

const slWorstPrice = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return quantizeNumber(
    new BigNumberInBase(stopLossValue.value || 0),
    market.value.priceTensMultiplier
  )
})

const tpMarginWithFee = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  const tpTotalNotional = new BigNumberInBase(tpWorstPrice.value).times(
    tpQuantizedQuantity.value
  )

  const tpMargin = quantizeNumber(
    tpTotalNotional,
    -market.value.quoteToken.decimals
  )

  const tpFeeAmount = tpTotalNotional.times(market.value.makerFeeRate)

  return tpMargin.plus(tpFeeAmount)
})

const slMarginWithFee = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  const slTotalNotional = new BigNumberInBase(slWorstPrice.value).times(
    slQuantizedQuantity.value
  )

  const slMargin = quantizeNumber(
    slTotalNotional,
    -market.value.quoteToken.decimals
  )

  const slFeeAmount = slTotalNotional.times(market.value.makerFeeRate)

  return slMargin.plus(slFeeAmount)
})

const isTpNotionalLessThanMinNotional = computed(() => {
  if (!market.value) {
    return false
  }

  const priceForNotional = new BigNumberInBase(tpTriggerPrice.value)

  if (
    !priceForNotional ||
    priceForNotional?.isZero() ||
    new BigNumberInBase(tpQuantizedQuantity.value).isZero()
  ) {
    return
  }

  return tpQuantizedQuantity.value
    .times(priceForNotional)
    .lt(market.value.minNotionalInToken)
})

const isSlNotionalLessThanMinNotional = computed(() => {
  if (!market.value) {
    return false
  }

  const priceForNotional = new BigNumberInBase(slTriggerPrice.value)

  if (
    !priceForNotional ||
    priceForNotional?.isZero() ||
    new BigNumberInBase(slQuantizedQuantity.value).isZero()
  ) {
    return
  }

  return slQuantizedQuantity.value
    .times(priceForNotional)
    .lt(market.value.minNotionalInToken)
})

const isSameTpSl = computed(() => {
  const isSameTp =
    takeProfitValue.value === tpOrderTriggerPrice.value &&
    tpQuantity.value === tpOrderQuantity.value

  const isSameSl =
    stopLossValue.value === slOrderTriggerPrice.value &&
    slQuantity.value === slOrderQuantity.value

  if (existingTpOrder.value && existingSlOrder.value) {
    return isSameTp && isSameSl
  } else if (existingTpOrder.value && !existingSlOrder.value) {
    return isSameTp && !stopLossValue.value
  } else if (!existingTpOrder.value && existingSlOrder.value) {
    return isSameSl && !takeProfitValue.value
  }

  return false
})

const isSubmitButtonDisabled = computed(() => {
  const isLoading = cancelTpStatus.isLoading() || cancelSlStatus.isLoading()

  const isInvalidTp =
    (!!takeProfitValue.value && !tpQuantity.value) ||
    (!takeProfitValue.value && !!tpQuantity.value)

  const isInvalidSl =
    (!!stopLossValue.value && !slQuantity.value) ||
    (!stopLossValue.value && !!slQuantity.value)

  const isEmptyTpSl =
    !tpQuantity.value &&
    !slQuantity.value &&
    !takeProfitValue.value &&
    !stopLossValue.value

  const hasErrorMessages =
    isTpMarkPriceThresholdError.value ||
    isSlMarkPriceThresholdError.value ||
    isTpNotionalLessThanMinNotional.value ||
    isSlNotionalLessThanMinNotional.value ||
    Object.values(errors.value).length > 0

  return (
    isLoading ||
    isInvalidTp ||
    isInvalidSl ||
    isEmptyTpSl ||
    isSameTpSl.value ||
    hasErrorMessages
  )
})

function onCloseModal() {
  emit('on:close')
  modalStore.closeModal(Modal.AddTakeProfitStopLoss)
}

function onOpenModal() {
  resetForm()
  setupTpSlInputs()
  availableQuantity.value = props.position.quantity || '0'
}

function setupTpSlInputs() {
  setTpQuantity('')
  setSlQuantity('')
  setStopLossValue('')
  setTakeProfitValue('')

  if (existingTpOrder.value) {
    setTpQuantity(tpOrderQuantity.value || '')
    setTakeProfitValue(tpOrderTriggerPrice.value || '')
  }

  if (existingSlOrder.value) {
    setSlQuantity(slOrderQuantity.value || '')
    setStopLossValue(slOrderTriggerPrice.value || '')
  }
}

function selectTpPartialOption(quantityPercentage: number) {
  setTpQuantity(
    availableQuantityToBigNumber.value
      .times(quantityPercentage)
      .dividedBy(100)
      .toFixed(
        market.value?.quantityDecimals || DEFAULT_ASSET_DECIMALS,
        BigNumber.ROUND_DOWN
      )
      .replace(/\.?0+$/, '')
  )
}

function selectSlPartialOption(quantityPercentage: number) {
  setSlQuantity(
    availableQuantityToBigNumber.value
      .times(quantityPercentage)
      .dividedBy(100)
      .toFixed(
        market.value?.quantityDecimals || DEFAULT_ASSET_DECIMALS,
        BigNumber.ROUND_DOWN
      )
      .replace(/\.?0+$/, '')
  )
}

function cancelTp() {
  if (!existingTpOrder.value) {
    return
  }

  cancelTpStatus.setLoading()

  derivativeStore
    .cancelOrder(existingTpOrder.value)
    .then(() => {
      notificationStore.update({ title: t('toast.trade.tpOrderCancelled') })

      setTpQuantity('')
      setTakeProfitValue('')
    })
    .catch($onError)
    .finally(() => {
      cancelTpStatus.setIdle()
    })
}

function cancelSl() {
  if (!existingSlOrder.value) {
    return
  }

  cancelSlStatus.setLoading()

  derivativeStore
    .cancelOrder(existingSlOrder.value)
    .then(() => {
      notificationStore.update({ title: t('toast.trade.slOrderCancelled') })

      setSlQuantity('')
      setStopLossValue('')
    })
    .catch($onError)
    .finally(() => {
      cancelSlStatus.setIdle()
    })
}

async function submitTpSl() {
  const { valid } = await validate()

  if (
    !valid ||
    !props.position ||
    !(takeProfitValue.value || stopLossValue.value)
  ) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitTpSlOrder({
      position: props.position,
      existingTpOrder: existingTpOrder.value,
      existingSlOrder: existingSlOrder.value,
      stopLossQuantity: new BigNumberInBase(slQuantity.value),
      takeProfitQuantity: new BigNumberInBase(tpQuantity.value),
      stopLossPrice: stopLossValue.value
        ? new BigNumberInBase(stopLossValue.value)
        : undefined,
      takeProfitPrice: takeProfitValue.value
        ? new BigNumberInBase(takeProfitValue.value)
        : undefined
    })
    .then(() => {
      const tpSuccessMessage = t('toast.trade.tpSuccessMessage', {
        price: `${takeProfitValue.value} ${market.value?.quoteToken?.symbol}`
      })

      const slSuccessMessage = t('toast.trade.slSuccessMessage', {
        price: `${stopLossValue.value} ${market.value?.quoteToken?.symbol}`
      })

      if (!takeProfitValue.value) {
        notificationStore.update({
          title: slSuccessMessage
        })

        return
      }

      if (!stopLossValue.value) {
        notificationStore.update({
          title: tpSuccessMessage
        })

        return
      }

      notificationStore.update({
        title: `${tpSuccessMessage}, ${t('common.and')} ${slSuccessMessage}`
      })
    })
    .catch($onError)
    .finally(() => {
      onCloseModal()
      status.setIdle()
    })
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.AddTakeProfitStopLoss]"
    v-bind="{
      isAlwaysOpen: status.isLoading(),
      ui: { width: 'sm:min-w-[550px] sm:max-w-[550px]' }
    }"
    @on:open="onOpenModal"
    @on:close="onCloseModal"
  >
    <template #title>
      <p class="sm:text-center max-sm:w-11/12">
        {{ $t('trade.modifyTakeProfitStopLoss') }}
      </p>
    </template>

    <div v-if="market && position">
      <div class="space-y-8">
        <ModalsAddTakeProfitStopLossHeader
          v-bind="{
            market,
            position,
            entryPrice,
            liquidationPrice,
            markPriceNotScaled,
            availableQuantityToFixed
          }"
        />

        <div class="flex flex-col gap-2">
          <div class="flex gap-8 max-sm:flex-wrap max-sm:gap-2">
            <ModalsAddTakeProfitStopLossTpPriceInput
              v-model="takeProfitValue"
              v-bind="{
                market,
                takeProfitErrorMessage
              }"
            />

            <ModalsAddTakeProfitStopLossTpQuantityInput
              v-model="tpQuantity"
              v-bind="{
                market,
                tpQuantityErrorMessage,
                isTpMarkPriceThresholdError,
                isTpNotionalLessThanMinNotional
              }"
              @option:update="selectTpPartialOption"
            />
          </div>

          <ModalsAddTakeProfitStopLossTpDetails
            v-bind="{
              isBuy,
              market,
              status,
              position,
              tpQuantity,
              entryPrice,
              cancelTpStatus,
              takeProfitValue,
              hasExistingTpOrder: !!existingTpOrder
            }"
            @tp:cancel="cancelTp"
          />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex gap-8 max-sm:flex-wrap max-sm:gap-2">
            <ModalsAddTakeProfitStopLossSlPriceInput
              v-model="stopLossValue"
              v-bind="{
                market,
                stopLossErrorMessage
              }"
            />

            <ModalsAddTakeProfitStopLossSlQuantityInput
              v-model="slQuantity"
              v-bind="{
                market,
                slQuantityErrorMessage,
                isSlMarkPriceThresholdError,
                isSlNotionalLessThanMinNotional
              }"
              @option:update="selectSlPartialOption"
            />
          </div>

          <ModalsAddTakeProfitStopLossSlDetails
            v-bind="{
              isBuy,
              market,
              status,
              position,
              slQuantity,
              entryPrice,
              stopLossValue,
              cancelSlStatus,
              hasExistingSlOrder: !!existingSlOrder
            }"
            @sl:cancel="cancelSl"
          />
        </div>

        <AppButton
          class="w-full"
          v-bind="{ status, disabled: isSubmitButtonDisabled }"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlConfirmButton)"
          @click="submitTpSl"
        >
          {{ $t('trade.confirmTpSl') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
