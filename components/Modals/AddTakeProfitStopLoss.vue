<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  Modal,
  TakeProfitStopLossForm,
  TakeProfitStopLossFormField
} from '@/types'

const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { resetForm, validate, errors } = useForm<TakeProfitStopLossForm>()

const props = withDefaults(
  defineProps<{
    position: PositionV2
  }>(),
  {}
)

const {
  liquidationPrice,
  price: entryPrice,
  markPriceNotScaled
} = useDerivativePosition(computed(() => props.position))

const status = reactive(new Status(StatusType.Idle))

const isModalOpen = computed(
  () => modalStore.modals[Modal.AddTakeProfitStopLoss]
)

const market = computed(() =>
  derivativeStore.markets.find(
    ({ marketId }) => marketId === props.position?.marketId
  )
)

const isBuy = computed(() => props.position?.direction === TradeDirection.Long)

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: TakeProfitStopLossFormField.TakeProfit,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const minValueRule = `minValue:${markPriceNotScaled.value.toFixed(
        market.value?.priceDecimals || 2
      )}`
      const maxValueRule = `maxValue:${liquidationPrice.value.toFixed(
        market.value?.priceDecimals || 2
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
          market.value?.priceDecimals || 2
        )}`

        const maxValueRule = `maxValue:${markPriceNotScaled.value.toFixed(
          market.value?.priceDecimals || 2
        )}`

        return [minValueRule, maxValueRule].join('|')
      } else {
        const maxValueRule = `maxValue:${liquidationPrice.value.toFixed(
          market.value?.priceDecimals || 2
        )}`

        const minValueRule = `minValue:${markPriceNotScaled.value.toFixed(
          market.value?.priceDecimals || 2
        )}`

        return [minValueRule, maxValueRule].join('|')
      }
    })
  })

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

const tpTriggerPrice = computed(() =>
  isTpDisabled.value?.triggerPrice
    ? sharedToBalanceInToken({
        value: isTpDisabled.value.triggerPrice,
        decimalPlaces: market.value?.quoteToken.decimals || 8
      })
    : undefined
)

const slTriggerPrice = computed(() =>
  isSlDisabled.value?.triggerPrice
    ? sharedToBalanceInToken({
        value: isSlDisabled.value.triggerPrice,
        decimalPlaces: market.value?.quoteToken.decimals || 8
      })
    : undefined
)

const takeProfitPnl = computed(() => {
  const takeProfitPrice = tpTriggerPrice.value
    ? new BigNumberInBase(tpTriggerPrice.value)
    : new BigNumberInBase(takeProfitValue.value || 0)

  const takeProfitTotal = takeProfitPrice.times(props.position?.quantity || 0)
  const entryTotal = entryPrice.value.times(props.position?.quantity || 0)

  return isBuy.value
    ? takeProfitTotal.minus(entryTotal)
    : entryTotal.minus(takeProfitTotal)
})

const stopLossPnl = computed(() => {
  const stopLossPrice = slTriggerPrice.value
    ? new BigNumberInBase(slTriggerPrice.value)
    : new BigNumberInBase(stopLossValue.value || 0)

  const stopLossTotal = stopLossPrice.times(props.position?.quantity || 0)
  const entryTotal = entryPrice.value.times(props.position?.quantity || 0)

  return isBuy.value
    ? stopLossTotal.minus(entryTotal)
    : entryTotal.minus(stopLossTotal)
})

async function submitTpSl() {
  const { valid } = await validate()

  if (
    !props.position ||
    !(takeProfitValue.value || stopLossValue.value) ||
    !valid
  ) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitTpSlOrder({
      position: props.position,
      stopLoss: stopLossValue.value
        ? new BigNumberInBase(stopLossValue.value)
        : undefined,
      takeProfit: takeProfitValue.value
        ? new BigNumberInBase(takeProfitValue.value)
        : undefined
    })
    .then(() => notificationStore.success({ title: t('common.success') }))
    .catch($onError)
    .finally(() => {
      closeModal()
      status.setIdle()
    })
}

function closeModal() {
  modalStore.closeModal(Modal.AddTakeProfitStopLoss)
}

const cancelTpStatus = reactive(new Status(StatusType.Idle))
const cancelSlStatus = reactive(new Status(StatusType.Idle))

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

watch(
  () => isModalOpen.value,
  () => {
    resetForm()
  }
)
</script>

<template>
  <AppModal :is-open="isModalOpen" @modal:closed="closeModal">
    <template #title>
      <p class="text-center font-bold">
        {{ $t('trade.takeProfitStopLossForEntirePosition') }}
      </p>
    </template>

    <div v-if="market && position">
      <div class="space-y-4 lg:max-w-sm">
        <div class="font-semibold text-xs">
          <div class="flex justify-between items-center border-b py-2">
            <p>{{ $t('trade.entryPrice') }}:</p>
            <p>
              <AppAmount
                v-bind="{
                  amount: entryPrice.toFixed(),
                  decimalPlaces: market.priceDecimals
                }"
                class="font-mono"
              />
            </p>
          </div>

          <div class="flex justify-between items-center border-b py-2">
            <p>{{ $t('trade.markPrice') }}:</p>
            <p>
              <AppAmount
                v-bind="{
                  amount: markPriceNotScaled.toFixed(),
                  decimalPlaces: market.priceDecimals
                }"
                class="font-mono"
              />
            </p>
          </div>

          <div class="flex justify-between items-center border-b py-2">
            <p>{{ $t('trade.estLiquidationPrice') }}:</p>
            <p>
              <AppAmount
                v-bind="{
                  amount: liquidationPrice.toFixed(),
                  decimalPlaces: market.priceDecimals
                }"
                class="font-mono"
              />
            </p>
          </div>

          <div class="flex justify-between items-center border-b py-2">
            <p>{{ $t('trade.direction') }}:</p>
            <p
              :class="{
                'text-green-500': position.direction === TradeDirection.Long,
                'text-red-500': position.direction === TradeDirection.Short
              }"
            >
              {{ $t(`trade.${position.direction}`) }}
            </p>
          </div>
        </div>

        <AppInputField
          v-if="!isTpDisabled"
          v-model="takeProfitValue"
          :decimals="market.priceDecimals"
          placeholder="Take Profit"
          class="placeholder:font-sans"
          :disabled="!!isTpDisabled"
        />

        <p v-if="takeProfitErrorMessage" class="error-message">
          {{ takeProfitErrorMessage }}
        </p>

        <i18n-t
          keypath="trade.takeProfitDetails"
          tag="p"
          class="text-xs text-coolGray-400"
        >
          <template #price>
            <span class="inline-flex">
              <span v-if="!takeProfitValue && !tpTriggerPrice"> &mdash;</span>
              <AppAmount
                v-else
                v-bind="{
                  amount: tpTriggerPrice || takeProfitValue,
                  decimalPlaces: market.priceDecimals
                }"
                class="font-mono"
              />
            </span>
          </template>
        </i18n-t>

        <p class="text-xs">
          <span>{{ $t('trade.profitLoss') }}: </span>

          <span v-if="!takeProfitValue && !tpTriggerPrice">&mdash;</span>
          <span
            v-else
            :class="[takeProfitPnl.gte(0) ? 'text-green-500' : 'text-red-500']"
            class="font-bold inline-flex gap-1"
          >
            <AppAmount
              v-bind="{
                amount: takeProfitPnl.toFixed(),
                decimalPlaces: market.priceDecimals
              }"
              class="font-mono"
            />
            <span>{{ market.quoteToken.symbol }}</span>
          </span>
        </p>

        <AppButton
          v-if="tpTriggerPrice"
          size="sm"
          class="w-full"
          variant="danger"
          v-bind="{ status: cancelTpStatus }"
          @click="cancelTp"
        >
          Cancel Take Profit
        </AppButton>

        <div class="border-b"></div>

        <AppInputField
          v-if="!isSlDisabled"
          v-model="stopLossValue"
          :decimals="market.priceDecimals"
          placeholder="Stop Loss"
          class="placeholder:font-sans"
          :disabled="!!isSlDisabled"
        />

        <p v-if="stopLossErrorMessage" class="error-message">
          {{ stopLossErrorMessage }}
        </p>

        <i18n-t
          keypath="trade.stopLossDetails"
          tag="p"
          class="text-xs text-coolGray-400"
        >
          <template #price>
            <span class="inline-flex">
              <span v-if="!stopLossValue && !slTriggerPrice"> &mdash;</span>
              <AppAmount
                v-else
                v-bind="{
                  amount: slTriggerPrice || stopLossValue,
                  decimalPlaces: market.priceDecimals
                }"
                class="font-mono"
              />
            </span>
          </template>
        </i18n-t>

        <p class="text-xs">
          <span>{{ $t('trade.profitLoss') }}: </span>

          <span v-if="!stopLossValue && !slTriggerPrice">&dash;</span>
          <span
            v-else
            :class="[stopLossPnl.gte(0) ? 'text-green-500' : 'text-red-500']"
            class="font-bold inline-flex gap-1"
          >
            <AppAmount
              v-bind="{
                amount: stopLossPnl.toFixed(),
                decimalPlaces: market.priceDecimals
              }"
              class="font-mono"
            />
            <span>{{ market.quoteToken.symbol }}</span>
          </span>
        </p>

        <AppButton
          v-if="slTriggerPrice"
          size="sm"
          class="w-full"
          variant="danger"
          v-bind="{ status: cancelSlStatus }"
          @click="cancelSl"
        >
          Cancel Stop Loss
        </AppButton>
      </div>

      <div v-if="!(isTpDisabled && isSlDisabled)" class="mt-4 pt-4 border-t">
        <AppButton
          :disabled="Object.values(errors).length > 0"
          v-bind="{ status }"
          class="w-full"
          @click="submitTpSl"
        >
          {{ $t('common.submit') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
