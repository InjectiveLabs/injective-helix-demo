<script setup lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
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

const { valueToString: quoteAmountToString } = useBigNumberFormatter(
  computed(() => formValues.value.bidPrice),
  { decimalPlaces: 2 }
)

function closeModal() {
  modalStore.closeModal(Modal.BidConfirm)
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
    :is-open="modalStore.modals[Modal.BidConfirm]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>Confirm</h3>
    </template>

    <AppHocLoading v-bind="{ status }">
      <div>
        <p class="pb-6">
          A new bid to purchase
          <span class="font-semibold">{{ formValues.baseAmount }}</span> DEMO
          will be placed at price
          <span class="font-semibold">{{ quoteAmountToString }} USDT</span>.
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
