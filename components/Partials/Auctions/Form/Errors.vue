<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { AuctionTradingForm } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()
const formValues = useFormValues<AuctionTradingForm>()

const currentBid = computed(() => {
  if (!spotStore.orderbook) {
    return 1
  }

  const TALIS_TOTAL_AMOUNT = 100000
  const TALIS_TOTAL_AMOINT_IN_WEI = new BigNumberInBase(TALIS_TOTAL_AMOUNT)
    .toWei(props.market.baseToken.decimals)
    .toNumber()

  let quantity = 0
  let currentBid = 1

  const orderbookSortedFromHighestBid = [...spotStore.orderbook.buys].sort(
    (a, b) => new BigNumberInBase(b.price).minus(a.price).toNumber()
  )

  for (const order of orderbookSortedFromHighestBid) {
    quantity += Number(order.quantity)

    if (quantity >= TALIS_TOTAL_AMOINT_IN_WEI) {
      currentBid = new BigNumberInWei(order.price)
        .toBase(
          props.market.baseToken.decimals - props.market.quoteToken.decimals
        )
        .toNumber()
      break
    }
  }

  return quantity < TALIS_TOTAL_AMOINT_IN_WEI ? 1 : currentBid
})

const bidSmallerThatCurrentBid = computed(() =>
  new BigNumberInBase(currentBid.value).gt(
    new BigNumberInBase(formValues.value.bidPrice || '0')
  )
)
</script>

<template>
  <div v-if="bidSmallerThatCurrentBid && formValues.bidPrice" class="py-3">
    <p class="text-[#F6A600]">
      Your offer price is lower than the current bid price means you will
      unlikely to get the tokens if the auction ends now.
    </p>
  </div>
</template>
