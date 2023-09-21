<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { AuctionTradingForm, Modal } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const modalStore = useModalStore()
const { validate, errors: formErrors } = useForm<AuctionTradingForm>()

async function handleBid() {
  const { valid } = await validate()
  if (!valid) {
    return
  }

  modalStore.openModal(Modal.BidConfirm)
}
</script>

<template>
  <div>
    <h3 class="text-2xl font-semibold">Place Bid</h3>
    <p class="text-gray-400">Price and Bid size</p>

    <PartialsAuctionsFormChart v-bind="{ market }" />

    <PartialsAuctionsFormBidPrice v-bind="{ market }" />

    <PartialsAuctionsFormAmount v-bind="{ market }" />

    <PartialsAuctionsFormAvailableAmount v-bind="{ market }" />

    <PartialsAuctionsFormErrors v-bind="{ market }" />

    <div>
      <button
        :disabled="Object.values(formErrors).length > 0"
        class="w-full bg-blue-400 text-white p-4 rounded-md font-semibold"
        :class="{ 'bg-gray-500': Object.values(formErrors).length > 0 }"
        @click="handleBid"
      >
        Place Bid
      </button>
    </div>

    <ModalsBidConfirm v-bind="{ market }" />
  </div>
</template>
