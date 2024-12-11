<script lang="ts" setup>
import {
  PositionV2,
  // TradeDirection,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'
// import { OrderSide } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
// import { ZERO_IN_BASE } from '@shared/utils/constant'
import { dataCyTag } from '@shared/utils'
// import { NuxtUiIcons } from '@shared/types'
import {
  UiDerivativeMarket,
  PerpetualMarketCyTags
  // ClosePositionLimitForm,
  // ClosePositionLimitFormField
} from '@/types'

const props = withDefaults(
  defineProps<{
    pnl: BigNumberInBase
    position: PositionV2
    isShrinked?: boolean
    quantity: BigNumberInBase
    market: UiDerivativeMarket
    hasReduceOnlyOrders: boolean
    isLimitOrderAuthorized: boolean
    isMarketOrderAuthorized: boolean
    reduceOnlyCurrentOrders: DerivativeLimitOrder[]
  }>(),
  {}
)
const { t } = useLang()
// const { lg } = useTwBreakpoints()
const { $onError } = useNuxtApp()
const positionStore = usePositionStore()
// const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
// const { validate } = useForm<ClosePositionLimitForm>()

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

function closePositionClicked() {
  if (!props.market) {
    return
  }

  if (props.pnl.isNaN()) {
    return notificationStore.error({ title: t('trade.no_liquidity') })
  }

  if (props.hasReduceOnlyOrders) {
    return closePositionAndReduceOnlyOrders()
  }

  closePosition()
}

function closePosition() {
  if (!props.market) {
    return
  }

  marketCloseStatus.setLoading()

  positionStore
    .closePosition({
      market: props.market,
      position: props.position
    })
    .then(() =>
      notificationStore.success({ title: t('trade.position_closed') })
    )
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })
}

function closePositionAndReduceOnlyOrders() {
  if (!props.market) {
    return
  }

  marketCloseStatus.setLoading()

  positionStore
    .closePositionAndReduceOnlyOrders({
      market: props.market,
      position: props.position,
      reduceOnlyOrders: props.reduceOnlyCurrentOrders
    })
    .then(() =>
      notificationStore.success({ title: t('trade.position_closed') })
    )
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })
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
      :class="[isShrinked ? 'p-1 outline-none rounded-full' : 'min-w-16']"
      :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosition)"
      @click="closePositionClicked"
    >
      <span v-if="!isShrinked">{{ $t('common.close') }}</span>
      <UIcon v-else :name="NuxtUiIcons.Trash" class="size-4" />
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
