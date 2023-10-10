<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { Auction, AuctionTradingForm, Modal } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  auction: {
    type: Object as PropType<Auction>,
    required: true
  }
})

const spotStore = useSpotStore()
const modalStore = useModalStore()
const { validate, errors: formErrors } = useForm<AuctionTradingForm>()

async function handleBid() {
  const { valid } = await validate()
  if (!valid) {
    return
  }

  modalStore.openModal(Modal.BidConfirm)
}

const currentProjectedPrice = computed(() => {
  if (!spotStore.orderbook) {
    return 1
  }

  const auctionTotalAmount = props.auction.tokensOffered
  const auctionTotalAmountInWei = new BigNumberInBase(auctionTotalAmount)
    .toWei(props.market.baseToken.decimals)
    .toNumber()

  let quantity = 0
  let currentProjectedPrice = 1

  const orderbookSortedFromHighestBid = [...spotStore.orderbook.buys].sort(
    (a, b) => new BigNumberInBase(b.price).minus(a.price).toNumber()
  )

  for (const order of orderbookSortedFromHighestBid) {
    quantity += Number(order.quantity)

    if (quantity >= auctionTotalAmountInWei) {
      currentProjectedPrice = new BigNumberInWei(order.price)
        .toBase(
          props.market.baseToken.decimals - props.market.quoteToken.decimals
        )
        .toNumber()
      break
    }
  }

  return quantity < auctionTotalAmountInWei ? 1 : currentProjectedPrice
})
</script>

<template>
  <div>
    <h3 class="text-2xl font-semibold">Place Bid</h3>
    <p class="text-gray-400">Price and Bid size</p>

    <PartialsAuctionsFormChart v-bind="{ market, currentProjectedPrice }" />

    <PartialsAuctionsFormLegend v-bind="{ currentProjectedPrice }" />

    <PartialsAuctionsFormBidPrice v-bind="{ market }" />

    <PartialsAuctionsFormAmount v-bind="{ market }" />

    <PartialsAuctionsFormAvailableAmount v-bind="{ market }" />

    <PartialsAuctionsFormErrors v-bind="{ currentProjectedPrice }" />

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
