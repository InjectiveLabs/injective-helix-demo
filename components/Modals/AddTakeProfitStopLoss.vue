<script setup lang="ts">
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import {
  Modal,
  TakeProfitStopLossForm,
  TakeProfitStopLossFormField
} from '@/types'

const props = withDefaults(
  defineProps<{ position: Position | PositionV2 | undefined }>(),
  { position: undefined }
)

const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()
const { resetForm, validate, errors } = useForm<TakeProfitStopLossForm>()

const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const isModalOpen = computed(
  () => modalStore.modals[Modal.AddTakeProfitStopLoss]
)

function closeModal() {
  modalStore.closeModal(Modal.AddTakeProfitStopLoss)
}

const market = computed(() =>
  derivativeStore.markets.find(
    ({ marketId }) => marketId === props.position?.marketId
  )
)

const isBuy = computed(() => props.position?.direction === TradeDirection.Long)

const markPrice = computed(() =>
  new BigNumberInWei(props.position?.markPrice || 0).toBase(
    market.value?.quoteToken.decimals
  )
)

const liquidationPrice = computed(() =>
  new BigNumberInWei(props.position?.liquidationPrice || 0).toBase(
    market.value?.quoteToken.decimals
  )
)

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: TakeProfitStopLossFormField.TakeProfit,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const minValueRule = `minValue:${markPrice.value.toFixed(
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

        const maxValueRule = `maxValue:${markPrice.value.toFixed(
          market.value?.priceDecimals || 2
        )}`

        return [minValueRule, maxValueRule].join('|')
      } else {
        const maxValueRule = `maxValue:${liquidationPrice.value.toFixed(
          market.value?.priceDecimals || 2
        )}`

        const minValueRule = `minValue:${markPrice.value.toFixed(
          market.value?.priceDecimals || 2
        )}`

        return [minValueRule, maxValueRule].join('|')
      }
    })
  })

const entryPrice = computed(() =>
  new BigNumberInWei(props.position?.entryPrice || 0).toBase(
    market.value?.quoteToken.decimals
  )
)

const takeProfitPnl = computed(() => {
  const takeProfitPrice = new BigNumberInBase(takeProfitValue.value || 0)

  const takeProfitTotal = takeProfitPrice.times(props.position?.quantity || 0)
  const entryTotal = entryPrice.value.times(props.position?.quantity || 0)

  return isBuy.value
    ? takeProfitTotal.minus(entryTotal)
    : entryTotal.minus(takeProfitTotal)
})

const stopLossPnl = computed(() => {
  const stopLossPrice = new BigNumberInBase(stopLossValue.value || 0)

  const stopLossTotal = stopLossPrice.times(props.position?.quantity || 0)
  const entryTotal = entryPrice.value.times(props.position?.quantity || 0)

  return isBuy.value
    ? stopLossTotal.minus(entryTotal)
    : entryTotal.minus(stopLossTotal)
})

watch(
  () => isModalOpen.value,
  () => {
    resetForm()
  }
)

const isTpDisabled = computed(() => {
  const orderType = isBuy.value ? OrderSide.TakeSell : OrderSide.TakeBuy

  return derivativeStore.subaccountConditionalOrders.some(
    (order) => order.orderType === orderType
  )
})

const isSlDisabled = computed(() => {
  const orderType = isBuy.value ? OrderSide.StopSell : OrderSide.StopBuy

  return derivativeStore.subaccountConditionalOrders.some(
    (order) => order.orderType === orderType
  )
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
                  amount: markPrice.toFixed(),
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
          v-model="takeProfitValue"
          :decimals="market.priceDecimals"
          placeholder="Take Profit"
          class="placeholder:font-sans"
          :disabled="isTpDisabled"
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
              <span v-if="!takeProfitValue"> &mdash;</span>
              <AppAmount
                v-else
                v-bind="{
                  amount: takeProfitValue,
                  decimalPlaces: market.priceDecimals
                }"
                class="font-mono"
              />
            </span>
          </template>
        </i18n-t>

        <p class="text-xs">
          <span>{{ $t('trade.profitLoss') }}: </span>

          <span v-if="!takeProfitValue">&mdash;</span>
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

        <div class="border-b"></div>

        <AppInputField
          v-model="stopLossValue"
          :decimals="market.priceDecimals"
          placeholder="Stop Loss"
          class="placeholder:font-sans"
          :disabled="isSlDisabled"
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
              <span v-if="!stopLossValue"> &mdash;</span>
              <AppAmount
                v-else
                v-bind="{
                  amount: stopLossValue,
                  decimalPlaces: market.priceDecimals
                }"
                class="font-mono"
              />
            </span>
          </template>
        </i18n-t>

        <p class="text-xs">
          <span>{{ $t('trade.profitLoss') }}: </span>

          <span v-if="!stopLossValue">&dash;</span>
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
      </div>

      <div class="mt-4">
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
