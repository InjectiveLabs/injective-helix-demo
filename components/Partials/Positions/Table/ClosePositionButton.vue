<script lang="ts" setup>
// import { TradeDirection } from '@injectivelabs/sdk-ts'
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  Modal,
  BusEvents,
  PerpetualMarketCyTags
  // ClosePositionLimitForm,
  // ClosePositionLimitFormField
} from '@/types'
// import { NuxtUiIcons } from '@shared/types'
// import { OrderSide } from '@injectivelabs/ts-types'
// import { ZERO_IN_BASE } from '@shared/utils/constant'
import type { TransformedPosition } from '@/types'

const jsonStore = useSharedJsonStore()
const modalStore = useSharedModalStore()
const breakpoints = useSharedBreakpoints()
// const derivativeStore = useDerivativeStore()
// const notificationStore = useSharedNotificationStore()
const { lg } = useSharedBreakpoints()
// const { validate } = useForm<ClosePositionLimitForm>()

const props = withDefaults(defineProps<{ row: TransformedPosition }>(), {})

const emit = defineEmits<{
  'position:set': [TransformedPosition]
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

function openPartialClosePositionModal() {
  try {
    emit('position:set', props.row)

    marketCloseStatus.setLoading()
    modalStore.openModal(Modal.PartialClosePosition)
  } catch {
    marketCloseStatus.setIdle()
  }
}

// todo: resurrect logic when limit orders are enabled
// async function closePositionLimit() {
//   const { valid } = await validate()

//   if (!props.row.market || !valid) {
//     return
//   }

//   limitCloseStatus.setLoading()

//   derivativeStore
//     .submitLimitOrder({
//       margin: ZERO_IN_BASE,
//       market: props.row.market,
//       price: new BigNumberInBase(priceValue.value),
//       quantity: new BigNumberInBase(quantityValue.value),
//       reduceOnly: true,
//       orderSide:
//         props.row.position.direction === TradeDirection.Long
//           ? OrderSide.SellPO
//           : OrderSide.BuyPO
//     })
//     .then(() => notificationStore.success({ title: t('toast.trade.positionClosed') }))
//     .catch($onError)
//     .finally(() => {
//       limitCloseStatus.setIdle()
//     })
// }
</script>

<template>
  <div class="flex items-center justify-center overflow-hidden space-x-2">
    <AppTooltip
      :ui="{ width: 'w-auto' }"
      :content="$t('trade.postOnlyWarning')"
      :is-disabled="!jsonStore.isPostUpgradeMode"
    >
      <AppButton
        v-bind="{
          status: marketCloseStatus,
          disabled: !row.isMarketOrderAuthorized || jsonStore.isPostUpgradeMode,
          tooltip: row.isMarketOrderAuthorized ? '' : $t('common.unauthorized')
        }"
        size="sm"
        :variant="'danger-shade'"
        :title="$t('trade.closePosition')"
        :class="[
          sixXl ? 'min-w-16' : lg ? 'p-1 outline-none rounded-full' : 'py-2'
        ]"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosition)"
        @click="openPartialClosePositionModal"
      >
        <span v-if="sixXl">{{ $t('common.close') }}</span>
        <UIcon v-else-if="lg" :name="NuxtUiIcons.Trash" class="size-4" />
        <span v-else>{{ $t('trade.closePosition') }}</span>
      </AppButton>
    </AppTooltip>

    <!-- todo: resurrect when limit orders reimplemented -->
    <!-- <UPopover :popper="{ placement: 'top' }">
      <AppButton
        v-bind="{
          disabled: !row.isLimitOrderAuthorized,
          tooltip: row.isLimitOrderAuthorized ? '' : $t('common.unauthorized')
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
              max: row.quantity.toNumber()
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
