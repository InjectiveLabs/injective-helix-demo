<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { quantizeNumber } from '@/app/utils/helpers'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_TOKEN_ASSET_DECIMALS
} from '@/app/utils/constants'
import {
  Modal,
  DerivativeTradeTypes,
  TakeProfitStopLossForm,
  TakeProfitStopLossFormField
} from '@/types'

const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()

const { t } = useLang()
const { $onError } = useNuxtApp()
const { sm } = useSharedBreakpoints()
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

const props = withDefaults(
  defineProps<{
    position: PositionV2
  }>(),
  {}
)

const availableQuantity = ref('0')
const status = reactive(new Status(StatusType.Idle))
const cancelTpStatus = reactive(new Status(StatusType.Idle))
const cancelSlStatus = reactive(new Status(StatusType.Idle))

const isBuy = computed(() => props.position?.direction === TradeDirection.Long)

const market = computed(() =>
  derivativeStore.markets.find(
    ({ marketId }) => marketId === props.position?.marketId
  )
)

const isTpDisabled = computed(() => {
  const orderType = isBuy.value ? OrderSide.TakeSell : OrderSide.TakeBuy

  return derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      order.orderType === orderType &&
      order.marketId === props.position.marketId &&
      order.subaccountId === props.position.subaccountId
  )
})

const isSlDisabled = computed(() => {
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
  isTpDisabled.value?.triggerPrice
    ? sharedToBalanceInToken({
        value: isTpDisabled.value.triggerPrice,
        decimalPlaces:
          market.value?.quoteToken.decimals || UI_DEFAULT_TOKEN_ASSET_DECIMALS
      })
    : undefined
)

const slOrderTriggerPrice = computed(() =>
  isSlDisabled.value?.triggerPrice
    ? sharedToBalanceInToken({
        value: isSlDisabled.value.triggerPrice,
        decimalPlaces:
          market.value?.quoteToken.decimals || UI_DEFAULT_TOKEN_ASSET_DECIMALS
      })
    : undefined
)

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: TakeProfitStopLossFormField.TakeProfit,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const minValueRule = `minValue:${markPriceNotScaled.value.toFixed(
        market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )}`

      const maxValueRule = `maxValue:${liquidationPrice.value.toFixed(
        market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )}`

      if (isBuy.value) {
        return minValueRule
      } else {
        return maxValueRule
      }
    })
  })

const { value: stopLossValue, errorMessage: stopLossErrorMessage } =
  useStringField({
    name: TakeProfitStopLossFormField.StopLoss,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      if (isBuy.value) {
        const minValueRule = `minValue:${liquidationPrice.value.toFixed(
          market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`

        const maxValueRule = `maxValue:${markPriceNotScaled.value.toFixed(
          market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`

        return [minValueRule, maxValueRule].join('|')
      } else {
        const maxValueRule = `maxValue:${liquidationPrice.value.toFixed(
          market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`

        const minValueRule = `minValue:${markPriceNotScaled.value.toFixed(
          market.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`

        return [minValueRule, maxValueRule].join('|')
      }
    })
  })

const {
  valueToFixed: availableQuantityToFixed,
  valueToBigNumber: availableQuantityToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => new BigNumberInBase(availableQuantity.value)),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
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

const isSubmitButtonDisabled = computed(() => {
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

  return isInvalidTp || isInvalidSl || isEmptyTpSl || hasErrorMessages
})

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
      stopLossPrice: stopLossValue.value
        ? new BigNumberInBase(stopLossValue.value)
        : undefined,
      takeProfitPrice: takeProfitValue.value
        ? new BigNumberInBase(takeProfitValue.value)
        : undefined,
      stopLossQuantity: new BigNumberInBase(slQuantity.value),
      takeProfitQuantity: new BigNumberInBase(tpQuantity.value)
    })
    .then(() => {
      const tpSuccessMessage = t('trade.tpSuccessMessage', {
        quantity: `${tpQuantity.value} ${market.value?.baseToken?.symbol}`,
        price: `${takeProfitValue.value} ${market.value?.quoteToken?.symbol}`
      })

      const slSuccessMessage = t('trade.slSuccessMessage', {
        quantity: `${slQuantity.value} ${market.value?.baseToken?.symbol}`,
        price: `${stopLossValue.value} ${market.value?.quoteToken?.symbol}`
      })

      if (!takeProfitValue.value) {
        notificationStore.success({
          title: slSuccessMessage
        })

        return
      }

      if (!stopLossValue.value) {
        notificationStore.success({
          title: tpSuccessMessage
        })

        return
      }

      notificationStore.success({
        title: `${tpSuccessMessage}, ${t('common.and')} ${slSuccessMessage}`
      })
    })
    .catch($onError)
    .finally(() => {
      closeModal()
      status.setIdle()
    })
}

function closeModal() {
  modalStore.closeModal(Modal.AddTakeProfitStopLoss)
}

function cancelTp() {
  if (!isTpDisabled.value) {
    return
  }

  cancelTpStatus.setLoading()

  derivativeStore
    .cancelOrder(isTpDisabled.value)
    .then(() => {
      notificationStore.success({ title: t('common.success') })
    })
    .catch($onError)
    .finally(() => {
      cancelTpStatus.setIdle()
    })
}

function cancelSl() {
  if (!isSlDisabled.value) {
    return
  }

  cancelSlStatus.setLoading()

  derivativeStore
    .cancelOrder(isSlDisabled.value)
    .then(() => {
      notificationStore.success({ title: t('common.success') })
    })
    .catch($onError)
    .finally(() => {
      cancelSlStatus.setIdle()
    })
}

function selectTpPartialOption(quantityPercentage: number) {
  setTpQuantity(
    availableQuantityToBigNumber.value
      .times(quantityPercentage)
      .dividedBy(100)
      .toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
  )
}

function selectSlPartialOption(quantityPercentage: number) {
  setSlQuantity(
    availableQuantityToBigNumber.value
      .times(quantityPercentage)
      .dividedBy(100)
      .toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
  )
}

function resetTakeProfitStopLossForm() {
  resetForm()
  availableQuantity.value = props.position.quantity || '0'
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.AddTakeProfitStopLoss]"
    v-bind="{
      isHideCloseButton: !sm,
      isAlwaysOpen: status.isLoading(),
      ui: { width: 'sm:min-w-[550px] sm:max-w-[550px]' }
    }"
    @on:open="resetTakeProfitStopLossForm"
  >
    <template #title>
      <p class="text-center font-bold">
        {{ $t('trade.takeProfitStopLossForPosition') }}
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
          <div class="flex gap-8 max-xs:flex-wrap max-xs:gap-2">
            <ModalsAddTakeProfitStopLossTpPriceInput
              v-model="takeProfitValue"
              v-bind="{
                market,
                takeProfitErrorMessage,
                isTpDisabled: !!isTpDisabled
              }"
            />

            <ModalsAddTakeProfitStopLossTpQuantityInput
              v-if="!isTpDisabled"
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
              position,
              tpQuantity,
              entryPrice,
              tpOrderTriggerPrice,
              takeProfitValue
            }"
          />

          <AppButton
            v-if="tpOrderTriggerPrice"
            class="w-full py-1.5 mt-2 text-blue-500"
            v-bind="{
              size: 'sm',
              status: cancelTpStatus,
              variant: 'primary-outline'
            }"
            @click="cancelTp"
          >
            {{ $t('trade.cancelTakeProfit') }}
          </AppButton>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex gap-8 max-xs:flex-wrap max-xs:gap-2">
            <ModalsAddTakeProfitStopLossSlPriceInput
              v-model="stopLossValue"
              v-bind="{
                market,
                stopLossErrorMessage,
                isSlDisabled: !!isSlDisabled
              }"
            />

            <ModalsAddTakeProfitStopLossSlQuantityInput
              v-if="!isSlDisabled"
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
              position,
              slQuantity,
              entryPrice,
              stopLossValue,
              slOrderTriggerPrice
            }"
          />

          <AppButton
            v-if="slOrderTriggerPrice"
            class="w-full py-1.5 mt-2 text-blue-500"
            v-bind="{
              size: 'sm',
              status: cancelSlStatus,
              variant: 'primary-outline'
            }"
            @click="cancelSl"
          >
            {{ $t('trade.cancelStopLoss') }}
          </AppButton>
        </div>

        <div v-if="!(isTpDisabled && isSlDisabled)">
          <AppButton
            class="w-full"
            v-bind="{ status, disabled: isSubmitButtonDisabled }"
            @click="submitTpSl"
          >
            {{ $t('common.submit') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>
