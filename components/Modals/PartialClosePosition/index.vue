<script setup lang="ts">
import { indexerDerivativesApi } from '@shared/Service'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { calculateWorstPriceFromPriceLevel } from '@/app/utils/helpers'
import { Modal, BusEvents, PartialLimitField } from '@/types'
import type { TransformedPosition } from '@/types'

const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    row: TransformedPosition
  }>(),
  {}
)

const emit = defineEmits<{
  'position:close': []
  'position:set': [value: undefined]
  'position:setQuantity': [value: string]
  'position:setLimitPrice': [value: string]
}>()

const partialOptions = computed(() => [
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: t('common.max'), value: 100 }
])

const isMarketPositionClose = ref(true)
const status = reactive(new Status(StatusType.Idle))

const availableQuantity = computed(() =>
  isMarketPositionClose.value ? props.row.quantity : props.row.availableQuantity
)

const {
  value: quantityValue,
  errorMessage: quantityErrorMessage,
  setValue: setQuantityValue
} = useStringField({
  name: PartialLimitField.PositionQuantity,
  dynamicRule: computed(
    () =>
      `maxValuePositionQuantity:${availableQuantity.value.toFixed(
        props.row.quantityDecimals
      )}`
  )
})

const {
  value: priceValue,
  errorMessage: priceErrorMessage,
  setValue: setPriceValue
} = useStringField({
  name: PartialLimitField.PositionPrice,
  dynamicRule: computed(() => {
    const formattedLiquidationPrice = props.row.liquidationPrice.toFixed(
      props.row.priceDecimals
    )

    if (props.row.position.direction === TradeDirection.Long) {
      return `minValue:${formattedLiquidationPrice}`
    }

    return `maxValue:${formattedLiquidationPrice}`
  })
})

const isSubmitButtonDisabled = computed(() => {
  const isQuantityInputError =
    !!quantityErrorMessage.value ||
    new BigNumberInBase(quantityValue.value).isNaN()

  const isPriceInputError =
    !!priceErrorMessage.value || new BigNumberInBase(priceValue.value).isNaN()

  if (isMarketPositionClose.value) {
    return isQuantityInputError
  }

  return (
    isPriceInputError ||
    isQuantityInputError ||
    props.row.availableQuantity.lte(0)
  )
})

function onSelectMarketPositionClose() {
  isMarketPositionClose.value = true
  setPriceValue('0')
}

function onSelectLimitPositionClose() {
  isMarketPositionClose.value = false
  setPriceValue(props.row.markPrice.toFixed(props.row.priceDecimals))
}

function onCloseModal() {
  emit('position:set', undefined)
  useEventBus(BusEvents.SetPositionStatusIdle).emit()
}

function selectPartialOption(quantityPercentage: number) {
  setQuantityValue(
    availableQuantity.value
      .times(quantityPercentage)
      .dividedBy(100)
      .toFixed(props.row.quantityDecimals, BigNumber.ROUND_DOWN)
  )
}

async function closePosition() {
  try {
    emit('position:setQuantity', quantityValue.value)
    emit('position:setLimitPrice', priceValue.value)

    if (!props.row.market) {
      return false
    }

    if (props.row.pnl.isNaN()) {
      notificationStore.error({ title: t('toast.trade.noLiquidity') })

      return false
    }

    status.setLoading()

    if (isMarketPositionClose.value) {
      const isShowWarningModal = await validateSlippage()

      if (isShowWarningModal) {
        modalStore.openModal(Modal.ClosePositionWarning)

        return
      }
    }

    emit('position:close')
  } catch {
    useEventBus(BusEvents.SetPositionStatusIdle).emit()
  } finally {
    modalStore.closeModal(Modal.PartialClosePosition)
  }
}

async function validateSlippage() {
  const orderbookRecords = await indexerDerivativesApi
    .fetchOrderbookV2(props.row.market.marketId)
    .catch($onError)

  const { worstPrice } = calculateWorstPriceFromPriceLevel(
    quantityValue.value,
    orderbookRecords?.sells || []
  )

  const formattedWorstPrice = sharedToBalanceInTokenInBase({
    value: worstPrice.toFixed(),
    decimalPlaces: props.row.market.quoteToken.decimals
  })

  const slippagePercentage = formattedWorstPrice
    .minus(props.row.markPrice)
    .abs()
    .dividedBy(
      BigNumber.max(formattedWorstPrice, props.row.markPrice.toNumber())
    )
    .times(100)

  return slippagePercentage.gt(5)
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.PartialClosePosition]"
    @on:close="onCloseModal"
  >
    <div>
      <div>
        <h4 class="text-xl capitalize text-coolGray-100 font-medium">
          {{ $t('trade.partialClosePositionModal.marketTitle') }}
        </h4>

        <ModalsPartialClosePositionTypeSelector
          v-bind="{ isMarketPositionClose }"
          @limit-order:select="onSelectLimitPositionClose"
          @market-order:select="onSelectMarketPositionClose"
        />
      </div>

      <div class="flex flex-col text-sm">
        <ModalsPartialClosePositionInfo
          v-bind="{
            row,
            availableQuantity,
            isMarketPositionClose
          }"
        />

        <div class="flex flex-col gap-2 mt-8">
          <h5 class="font-semibold">{{ $t('trade.quantity') }}</h5>

          <div class="relative">
            <AppInputField
              v-model="quantityValue"
              v-bind="{
                noStyle: true,
                alignLeft: true,
                placeholder: '0.00',
                decimals: row.quantityDecimals,
                inputClasses:
                  'placeholder-coolGray-450 text-sm p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
              }"
            />

            <div
              class="flex gap-4 absolute right-3 top-1/2 -translate-y-1/2 bg-brand-875 p-1"
            >
              <ModalsPartialClosePositionOption
                v-for="(option, index) in partialOptions"
                :key="index"
                v-bind="{ label: option.label, value: option.value }"
                @option:update="selectPartialOption"
              />
            </div>
          </div>

          <p v-if="quantityErrorMessage" class="error-message">
            {{ quantityErrorMessage }}
          </p>
        </div>

        <div v-if="!isMarketPositionClose" class="flex flex-col gap-2 mt-8">
          <h5 class="font-semibold">{{ $t('trade.price') }}</h5>

          <div class="relative">
            <AppInputField
              v-model="priceValue"
              v-bind="{
                noStyle: true,
                alignLeft: true,
                placeholder: '0.00',
                decimals: row.priceDecimals,
                inputClasses:
                  'placeholder-coolGray-450 text-sm p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
              }"
            />
          </div>

          <p v-if="priceErrorMessage" class="error-message">
            {{ priceErrorMessage }}
          </p>
        </div>

        <AppButton
          class="mt-10 py-1.5 px-6 ml-auto"
          v-bind="{
            status,
            disabled: isSubmitButtonDisabled
          }"
          @click="closePosition"
        >
          {{ $t('common.confirm') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
