<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { AuctionTradingForm } from '@/types'

const props = defineProps({
  currentProjectedPrice: {
    type: Number,
    required: true
  }
})

const formValues = useFormValues<AuctionTradingForm>()

const bidSmallerThatCurrentBid = computed(() =>
  new BigNumberInBase(props.currentProjectedPrice).gt(
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
