<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { Auction } from '@/types'

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

const orderHistoryFiltered = computed(() =>
  spotStore.subaccountOrderHistory.filter(
    (order) => order.marketId === props.market.marketId
  )
)

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
  <div class="grid grid-cols-1">
    <h3 class="text-3xl font-semibold mb-10">My Bids</h3>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead
          class="text-gray-400 text-xs tracking-wider font-semibold uppercase"
        >
          <th class="pr-2 text-left py-4">Time</th>
          <th class="px-2 text-left">Offer Price</th>
          <th class="px-2 text-right">Amount</th>
          <th class="px-2 text-right">Total</th>
          <th class="px-2 text-right">Status</th>
        </thead>
        <tbody>
          <PartialsAuctionsMyBidsRow
            v-for="order in orderHistoryFiltered"
            :key="`order-${order.orderHash}`"
            v-bind="{ order, market, currentProjectedPrice }"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
