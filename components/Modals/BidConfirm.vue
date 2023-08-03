<script setup lang="ts">
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { AuctionTradingForm, Modal } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()
const modalStore = useModalStore()
const formValues = useFormValues<AuctionTradingForm>()
const { success, error } = useNotifications()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const amount = computed(() => {
  if (spotStore.subaccountOrders.length > 0) {
    return new BigNumberInWei(spotStore.subaccountOrders[0].price)
      .toBase(
        props.market.quoteToken.decimals - props.market.baseToken.decimals
      )
      .toFixed(2)
  }

  return null
})

function closeModal() {
  modalStore.closeModal(Modal.BidConfirm)
}

function handleCancelAndBid() {
  status.setLoading()

  const action =
    spotStore.subaccountOrders.length === 1
      ? spotStore.cancelOrder(spotStore.subaccountOrders[0])
      : spotStore.batchCancelOrder(spotStore.subaccountOrders)

  action
    .then(() => {
      spotStore
        .submitLimitOrder({
          market: props.market,
          price: new BigNumberInBase(formValues.value.bidPrice || 0),
          quantity: new BigNumberInBase(formValues.value.baseAmount || 0),
          orderSide: OrderSide.Buy
        })
        .then(() => {
          success({ title: 'Success', description: 'Bid created!' })
        })
        .finally(() => {
          status.setIdle()
          closeModal()
        })
    })
    .catch((e) => {
      status.setIdle()
      closeModal()
      error({ title: 'Error', description: 'Something happened...' })
      $onError(e)
    })
}

function handleBid() {
  status.setLoading()

  spotStore
    .submitLimitOrder({
      market: props.market,
      price: new BigNumberInBase(formValues.value.bidPrice || 0),
      quantity: new BigNumberInBase(formValues.value.baseAmount || 0),
      orderSide: OrderSide.Buy
    })
    .then(() => {
      success({ title: 'Success', description: 'Bid created!' })
    })
    .finally(() => {
      status.setIdle()
      closeModal()
    })
    .catch((e) => {
      $onError(e)
      error({ title: 'Error', description: 'Something happened...' })
    })
}
</script>

<template>
  <AppModal
    :show="modalStore.modals[Modal.BidConfirm]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>Confirm</h3>
    </template>

    <AppHocLoading v-bind="{ status }">
      <div v-if="spotStore.subaccountOrders.length > 0">
        <p class="pb-6">
          The previous bid price at
          <span class="font-semibold">{{ amount }} USDT</span> will be cancelled
          and a new bid price will be placed at
          <span class="font-semibold">{{ formValues.quoteAmount }} USDT</span>.
        </p>
        <AppButton
          class="w-full bg-blue-400 text-white rounded-md font-semibold"
          @click="handleCancelAndBid"
        >
          Confirm
        </AppButton>
      </div>

      <div v-else>
        <p class="pb-6">
          A new bid price will be placed at
          <span class="font-semibold">{{ formValues.quoteAmount }} USDT</span>.
        </p>
        <AppButton
          class="w-full bg-blue-400 text-white rounded-md font-semibold"
          @click="handleBid"
        >
          Confirm
        </AppButton>
      </div>
    </AppHocLoading>
  </AppModal>
</template>
