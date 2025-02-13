<script lang="ts" setup>
import {
  PositionV2,
  // TradeDirection,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { indexerDerivativesApi } from '@shared/Service'
// import { NuxtUiIcons } from '@shared/types'
// import { OrderSide } from '@injectivelabs/ts-types'
// import { ZERO_IN_BASE } from '@shared/utils/constant'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { calculateWorstPriceFromPriceLevel } from '@/app/utils/helpers'
import {
  Modal,
  BusEvents,
  UiDerivativeMarket,
  PerpetualMarketCyTags,
  PositionAndReduceOnlyOrders
  // ClosePositionLimitForm,
  // ClosePositionLimitFormField
} from '@/types'

const modalStore = useSharedModalStore()
const breakpoints = useSharedBreakpoints()
// const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { lg } = useSharedBreakpoints()
// const { validate } = useForm<ClosePositionLimitForm>()

const props = withDefaults(
  defineProps<{
    pnl: BigNumberInBase
    position: PositionV2
    quantity: BigNumberInBase
    market: UiDerivativeMarket
    markPrice: BigNumberInBase
    hasReduceOnlyOrders: boolean
    isLimitOrderAuthorized: boolean
    isMarketOrderAuthorized: boolean
    reduceOnlyCurrentOrders: DerivativeLimitOrder[]
  }>(),
  {}
)

const emit = defineEmits<{
  'position:close': []
  'position:set': [PositionAndReduceOnlyOrders]
}>()

// const limitCloseStatus = reactive(new Status(StatusType.Idle))
const marketCloseStatus = reactive(new Status(StatusType.Idle))

// const { value: priceValue } = useStringField({
//   name: ClosePositionLimitFormField.Price,
//   initialValue: ''
// })

// const { value: quantityValue } = useStringField({
//   name: ClosePositionLimitFormField.Quantity,
//   initialValue: ''
// })

// const isInputEmpty = computed(() => {
//   const price = new BigNumberInBase(priceValue.value)
//   const quantity = new BigNumberInBase(quantityValue.value)

//   return (
//     price.isNaN() || price.isZero() || quantity.isNaN() || quantity.isZero()
//   )
// })

const sixXl = breakpoints['6xl']

onMounted(() => {
  useEventBus(BusEvents.SetPositionStatusIdle).on(() => {
    marketCloseStatus.setIdle()
  })
})

async function validateSlippage() {
  const orderbookRecords = await indexerDerivativesApi
    .fetchOrderbookV2(props.market.marketId)
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })

  const { worstPrice } = calculateWorstPriceFromPriceLevel(
    props.quantity.toString(),
    orderbookRecords?.sells || []
  )

  const formattedWorstPrice = parseFloat(
    sharedToBalanceInToken({
      value: worstPrice.toFixed(),
      decimalPlaces: props.market.quoteToken.decimals
    })
  )

  const formattedMarkPrice = parseFloat(props.markPrice.toFixed())

  const slippagePercentage = Math.abs(
    (Math.abs(formattedWorstPrice - formattedMarkPrice) /
      ((formattedWorstPrice + formattedMarkPrice) / 2)) *
      100
  )

  if (slippagePercentage > 5) {
    return true
  } else {
    return false
  }
}

async function closePosition() {
  emit('position:set', {
    position: props.position,
    reduceOnlyOrders: props.reduceOnlyCurrentOrders
  })

  if (!props.market) {
    return false
  }

  if (props.pnl.isNaN()) {
    notificationStore.error({ title: t('trade.no_liquidity') })

    return false
  }

  const isShowWarningModal = await validateSlippage()

  marketCloseStatus.setLoading()

  if (isShowWarningModal) {
    modalStore.openModal(Modal.ClosePositionWarning)

    return
  }

  emit('position:close')
}

// todo: resurrect logic when limit orders are enabled
// async function closePositionLimit() {
//   const { valid } = await validate()

//   if (!props.market || !valid) {
//     return
//   }

//   limitCloseStatus.setLoading()

//   derivativeStore
//     .submitLimitOrder({
//       margin: ZERO_IN_BASE,
//       market: props.market,
//       price: new BigNumberInBase(priceValue.value),
//       quantity: new BigNumberInBase(quantityValue.value),
//       reduceOnly: true,
//       orderSide:
//         props.position.direction === TradeDirection.Long
//           ? OrderSide.SellPO
//           : OrderSide.BuyPO
//     })
//     .then(() => notificationStore.success({ title: t('common.success') }))
//     .catch($onError)
//     .finally(() => {
//       limitCloseStatus.setIdle()
//     })
// }
</script>

<template>
  <div class="flex items-center justify-center overflow-hidden space-x-2">
    <AppButton
      v-bind="{
        status: marketCloseStatus,
        disabled: !isMarketOrderAuthorized,
        tooltip: isMarketOrderAuthorized ? '' : $t('common.unauthorized')
      }"
      size="sm"
      :variant="'danger-shade'"
      :title="$t('trade.closePosition')"
      :class="[
        sixXl ? 'min-w-16' : lg ? 'p-1 outline-none rounded-full' : 'py-2'
      ]"
      :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosition)"
      @click="closePosition"
    >
      <span v-if="sixXl">{{ $t('common.close') }}</span>
      <UIcon v-else-if="lg" :name="NuxtUiIcons.Trash" class="size-4" />
      <span v-else>{{ $t('trade.closePosition') }}</span>
    </AppButton>

    <!-- todo: resurrect when limit orders reimplemented -->
    <!-- <UPopover :popper="{ placement: 'top' }">
      <AppButton
        v-bind="{
          disabled: !isLimitOrderAuthorized,
          tooltip: isLimitOrderAuthorized ? '' : $t('common.unauthorized')
        }"
        size="sm"
        :variant="lg ? 'danger-ghost' : 'primary'"
        :class="[!lg ? 'py-2' : 'min-w-20']"
      >
        {{ $t('trade.limit') }}
      </AppButton>

      <template #panel>
        <div class="p-4 bg-brand-900 border-brand-700 flex flex-col gap-4">
          <AppInputBase
            v-bind="{
              max: quantity.toNumber()
            }"
            v-model="quantityValue"
            autofix
            class="p-1 rounded min-w-0 border w-20 text-xs"
            placeholder="Qty"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePositionQty)"
          />
          <AppInputBase
            v-model="priceValue"
            class="p-1 rounded min-w-0 border w-20 text-xs"
            placeholder="Price"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosPrice)"
          />
          <UButton
            class="w-20 flex justify-center items-center text-xs dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-slate-50"
            size="sm"
            :disabled="isInputEmpty"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosLimit)"
            @click="closePositionLimit"
          >
            <span v-if="limitCloseStatus.isLoading()" class="flex">
              <UIcon class="animate-spin size-4" :name="NuxtUiIcons.Loading" />
            </span>
            <span v-else>{{ $t('common.confirm') }}</span>
          </UButton>
        </div>
      </template>
    </UPopover> -->
  </div>
</template>
