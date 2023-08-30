<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { AuctionTradingForm } from '~/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})
const formValues = useFormValues<AuctionTradingForm>()
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
  new BigNumberInBase(formValues.value.baseAmount || 0).times(
    formValues.value.bidPrice || 0
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
</script>

<template>
  <div class="py-4">
    <div class="flex justify-between items-center">
      <p>Available</p>
      <div class="border-t border-gray-600 border-dashed flex-1 mx-2" />
      <p>
        <span>{{ availableUsdToString }}</span>
        <span class="text-gray-500 ml-1">USDT</span>
      </p>
    </div>

    <div class="flex justify-between items-center">
      <p>Total</p>
      <div class="border-t border-gray-600 border-dashed flex-1 mx-2" />
      <p>
        <span v-if="totalUsd.eq(0)">-</span>
        <span v-else>{{ totalUsdToString }}</span>
        <span class="text-gray-500 ml-1">USDT</span>
      </p>
    </div>
  </div>
</template>
