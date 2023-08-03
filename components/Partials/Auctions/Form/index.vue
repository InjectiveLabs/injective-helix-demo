<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { GridSpotTradingForm, Modal } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const modalStore = useModalStore()
const { validate, values: formValues } = useForm<GridSpotTradingForm>()

const { accountBalancesWithToken } = useBalance()

const availableUsd = computed(() => {
  const quoteBalance = accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )
  return new BigNumberInWei(quoteBalance?.availableMargin || '0').toBase(
    props.market.quoteToken.decimals
  )
})

const totalUsd = computed(() =>
  new BigNumberInBase(formValues.baseAmount || 0).times(
    formValues.bidPrice || 0
  )
)

const { valueToString: availableUsdToString } = useBigNumberFormatter(
  availableUsd,
  {
    decimalPlaces: 2
  }
)

const { valueToString: totalUsdToString } = useBigNumberFormatter(totalUsd, {
  decimalPlaces: 2
})

async function handleBid() {
  const { valid } = await validate()
  if (!valid) {
    return
  }

  modalStore.openModal({ type: Modal.BidConfirm })
}
</script>

<template>
  <div>
    <h3 class="text-2xl font-semibold">Place Bid now</h3>
    <p class="text-gray-400">Price & Bid size</p>

    <PartialsAuctionsFormChart v-bind="{ market }" />

    <PartialsAuctionsFormBidPrice v-bind="{ market }" />

    <PartialsAuctionsFormAmount v-bind="{ market, availableUsd }" />

    <div class="py-4">
      <div class="flex justify-between items-center">
        <p>Available</p>

        <p>
          <span>{{ availableUsdToString }}</span>
          <span class="text-gray-500 ml-1">USDT</span>
        </p>
      </div>

      <div class="flex justify-between items-center">
        <p>Total</p>

        <p>
          <span v-if="totalUsd.eq(0)">-</span>
          <span v-else>{{ totalUsdToString }}</span>
          <span class="text-gray-500 ml-1">USDT</span>
        </p>
      </div>
    </div>

    <div>
      <button
        class="w-full bg-blue-400 text-white p-4 rounded-md font-semibold"
        @click="handleBid"
      >
        Place Bid
      </button>
    </div>

    <ModalsBidConfirm v-bind="{ market }" />
  </div>
</template>
