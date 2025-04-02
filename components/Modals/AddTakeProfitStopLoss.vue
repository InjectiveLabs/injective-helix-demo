<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
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
const { sm } = useSharedBreakpoints()
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

const availableQuantity = ref('0')
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
    () => `maxValuePositionQuantity:${availableQuantityToFixed.value}`
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
    () => `maxValuePositionQuantity:${availableQuantityToFixed.value}`
  )
})

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

function selectTpPartialOption(value: number) {
  const quantityPartialAmount = value
  const quantityPercentage = quantityPartialAmount / 100

  setTpQuantity(
    availableQuantityToBigNumber.value
      .times(quantityPercentage)
      .toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
  )
}

function selectSlPartialOption(value: number) {
  const quantityPartialAmount = value
  const quantityPercentage = quantityPartialAmount / 100

  setSlQuantity(
    availableQuantityToBigNumber.value
      .times(quantityPercentage)
      .toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
  )
}

watch(
  () => isModalOpen.value,
  () => {
    resetForm()
    availableQuantity.value = props.position.quantity || '0'
  }
)

onMounted(() => {
  availableQuantity.value = props.position.quantity || '0'
})
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.AddTakeProfitStopLoss]"
    v-bind="{
      isHideCloseButton: !sm,
      isAlwaysOpen: status.isLoading(),
      ui: { width: 'sm:min-w-[550px] sm:max-w-[550px]' }
    }"
  >
    <template #title>
      <p class="text-center font-bold">
        {{ $t('trade.takeProfitStopLossForPosition') }}
      </p>
    </template>

    <div v-if="market && position">
      <div class="space-y-8">
        <div class="font-semibold text-xs">
          <div class="flex justify-between items-center border-b py-2">
            <p>{{ $t('trade.entryPrice') }}:</p>
            <p>
              <AppAmount
                v-bind="{
                  amount: entryPrice.toFixed(),
                  decimalPlaces: market.priceDecimals
                }"
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
              />
            </p>
          </div>

          <div class="flex justify-between items-center border-b py-2">
            <p>{{ $t('trade.totalQuantitySize') }}:</p>
            <p>
              <AppAmount
                v-bind="{
                  amount: availableQuantityToFixed,
                  decimalPlaces: market.priceDecimals
                }"
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

        <div class="flex flex-col gap-2">
          <div class="flex gap-8 max-xs:flex-wrap max-xs:gap-2">
            <div class="flex flex-col flex-1 gap-2">
              <h5 class="font-semibold text-xs">
                {{ $t('trade.takeProfitTriggerPrice') }}
              </h5>

              <AppInputField
                v-if="!isTpDisabled"
                v-model="takeProfitValue"
                v-bind="{
                  noStyle: true,
                  alignLeft: true,
                  placeholder: '0.00',
                  decimals: market.priceDecimals,
                  inputClasses:
                    'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
                }"
              />

              <p v-if="takeProfitErrorMessage" class="error-message">
                {{ takeProfitErrorMessage }}
              </p>
            </div>

            <div v-if="!isTpDisabled" class="flex flex-col flex-1 gap-2">
              <h5 class="font-semibold text-xs">
                {{ $t('trade.takeProfitQuantity') }}
              </h5>

              <div class="relative">
                <AppInputField
                  v-model="tpQuantity"
                  v-bind="{
                    noStyle: true,
                    alignLeft: true,
                    placeholder: '0.00',
                    decimals: market.priceDecimals,
                    inputClasses:
                      'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
                  }"
                />

                <div
                  class="flex gap-4 absolute right-3 top-1/2 -translate-y-1/2 bg-brand-875 p-1"
                >
                  <ModalsPartialClosePositionOption
                    v-bind="{ label: 'Max', value: 100 }"
                    @option:update="selectTpPartialOption"
                  />
                </div>
              </div>

              <p v-if="tpQuantityErrorMessage" class="error-message">
                {{ tpQuantityErrorMessage }}
              </p>
            </div>
          </div>

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
                />
              </span>
            </template>
          </i18n-t>

          <p class="text-xs">
            <span>{{ $t('trade.profitLoss') }}: </span>

            <span v-if="!takeProfitValue && !tpTriggerPrice">&mdash;</span>
            <span
              v-else
              :class="[
                takeProfitPnl.gte(0) ? 'text-green-500' : 'text-red-500'
              ]"
              class="font-bold inline-flex gap-1"
            >
              <AppAmount
                v-bind="{
                  amount: takeProfitPnl.toFixed(),
                  decimalPlaces: market.priceDecimals
                }"
              />
              <span>{{ market.quoteToken.symbol }}</span>
            </span>
          </p>

          <AppButton
            v-if="tpTriggerPrice"
            class="w-full py-1.5 mt-2 text-blue-500"
            size="sm"
            variant="primary-outline"
            v-bind="{ status: cancelTpStatus }"
            @click="cancelTp"
          >
            {{ $t('trade.cancelTakeProfit') }}
          </AppButton>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex gap-8 max-xs:flex-wrap max-xs:gap-2">
            <div class="flex flex-col flex-1 gap-2">
              <h5 class="font-semibold text-xs">
                {{ $t('trade.stopLossTriggerPrice') }}
              </h5>
              <AppInputField
                v-if="!isSlDisabled"
                v-model="stopLossValue"
                v-bind="{
                  noStyle: true,
                  alignLeft: true,
                  placeholder: '0.00',
                  decimals: market.priceDecimals,
                  inputClasses:
                    'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
                }"
              />

              <p v-if="stopLossErrorMessage" class="error-message">
                {{ stopLossErrorMessage }}
              </p>
            </div>

            <div v-if="!isSlDisabled" class="flex flex-col flex-1 gap-2">
              <h5 class="font-semibold text-xs">
                {{ $t('trade.stopLossQuantity') }}
              </h5>

              <div class="relative text-sm">
                <AppInputField
                  v-model="slQuantity"
                  v-bind="{
                    noStyle: true,
                    alignLeft: true,
                    placeholder: '0.00',
                    decimals: market.priceDecimals,
                    inputClasses:
                      'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
                  }"
                />

                <div
                  class="flex gap-4 absolute right-3 top-1/2 -translate-y-1/2 bg-brand-875 p-1"
                >
                  <ModalsPartialClosePositionOption
                    v-bind="{ label: 'Max', value: 100 }"
                    @option:update="selectSlPartialOption"
                  />
                </div>
              </div>

              <p v-if="slQuantityErrorMessage" class="error-message">
                {{ slQuantityErrorMessage }}
              </p>
            </div>
          </div>

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
              />
              <span>{{ market.quoteToken.symbol }}</span>
            </span>
          </p>

          <AppButton
            v-if="slTriggerPrice"
            class="w-full py-1.5 mt-2 text-blue-500"
            size="sm"
            variant="primary-outline"
            v-bind="{ status: cancelSlStatus }"
            @click="cancelSl"
          >
            {{ $t('trade.cancelStopLoss') }}
          </AppButton>
        </div>

        <div v-if="!(isTpDisabled && isSlDisabled)">
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
    </div>
  </AppModal>
</template>
