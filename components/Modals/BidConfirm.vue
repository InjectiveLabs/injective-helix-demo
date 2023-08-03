<script setup lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { GridSpotTradingForm, Modal } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()
const modalStore = useModalStore()
const formValues = useFormValues<GridSpotTradingForm>()
const { success, error } = useNotifications()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

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
        <AppButton @click="handleCancelAndBid"> Cancel And Bid </AppButton>
      </div>

      <div v-else>
        <AppButton @click="handleBid">JustBid</AppButton>
      </div>
    </AppHocLoading>
  </AppModal>
</template>
