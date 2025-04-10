<script setup lang="ts">
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { indexerDerivativesApi } from '@shared/Service'
import { calculateWorstPriceFromPriceLevel } from '@/app/utils/helpers'
import { Modal, BusEvents, TransformedPosition } from '@/types'

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
}>()

const partialOptions = [
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: t('common.max'), value: 100 }
]

const availableQuantity = ref('0')
const status = reactive(new Status(StatusType.Idle))

const {
  valueToFixed: availableQuantityToFixed,
  valueToString: availableQuantityToString,
  valueToBigNumber: availableQuantityToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => new BigNumberInBase(availableQuantity.value)),
  { decimalPlaces: props.row.quantityDecimals }
)

const {
  value: quantityValue,
  errorMessage: quantityErrorMessage,
  setValue: setQuantityValue
} = useStringField({
  name: 'positionQuantity',
  rule: 'required',
  dynamicRule: computed(
    () => `maxValuePositionQuantity:${availableQuantityToFixed.value}`
  )
})

function selectPartialOption(quantityPercentage: number) {
  setQuantityValue(
    availableQuantityToBigNumber.value
      .times(quantityPercentage)
      .dividedBy(100)
      .toFixed(props.row.quantityDecimals)
  )
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

async function closePosition() {
  try {
    emit('position:setQuantity', quantityValue.value)

    if (!props.row.market) {
      return false
    }

    if (props.row.pnl.isNaN()) {
      notificationStore.error({ title: t('trade.no_liquidity') })

      return false
    }

    status.setLoading()

    const isShowWarningModal = await validateSlippage()

    if (isShowWarningModal) {
      modalStore.openModal(Modal.ClosePositionWarning)

      return
    }

    emit('position:close')
  } catch (error) {
    useEventBus(BusEvents.SetPositionStatusIdle).emit()
  } finally {
    modalStore.closeModal(Modal.PartialClosePosition)
  }
}

function onCloseModal() {
  emit('position:set', undefined)
  useEventBus(BusEvents.SetPositionStatusIdle).emit()
}

onMounted(() => {
  availableQuantity.value = props.row.position.quantity
})
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.PartialClosePosition]"
    @on:close="onCloseModal"
  >
    <template #title>
      <p class="font-semibold">
        {{ $t('partialPositionClose.marketTitle') }}
      </p>
    </template>

    <div class="flex flex-col text-xs">
      <div class="flex gap-4 justify-between border-b py-2">
        <h5 class="text-coolGray-450 font-semibold">
          {{ $t('partialPositionClose.totalPositionSize') }}:
        </h5>
        <span class="font-mono">
          {{ availableQuantityToString }} {{ row.market.baseToken.symbol }}
        </span>
      </div>

      <div class="flex gap-4 justify-between border-b py-2">
        <h5 class="text-coolGray-450 font-semibold">
          {{ $t('partialPositionClose.marketPrice') }}:
        </h5>
        <span>{{ $t('home.market') }}</span>
      </div>

      <div class="flex flex-col gap-2 mt-4">
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
                'placeholder-coolGray-450 text-sm font-mono p-4 ring-[#181E31] dark:bg-brand-875 dark:rounded-lg'
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

      <AppButton
        class="w-full mt-6"
        v-bind="{
          status,
          disabled:
            !!quantityErrorMessage || new BigNumberInBase(quantityValue).isNaN()
        }"
        @click="closePosition"
      >
        {{ $t('common.confirm') }}
      </AppButton>
    </div>
  </AppModal>
</template>
