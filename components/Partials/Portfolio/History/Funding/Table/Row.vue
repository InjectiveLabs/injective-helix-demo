<script setup lang="ts">
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps({
  fundingPayment: {
    required: true,
    type: Object as PropType<FundingPayment>
  }
})

const { market, time, total } = useFundingPayment(
  computed(() => props.fundingPayment)
)

const { valueToString: totalToString } = useSharedBigNumberFormatter(total, {
  decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
})
</script>

<template>
  <div v-if="market" class="flex p-2 text-xs">
    <div class="p-2 basis-1/5 flex items-center">
      <div>{{ time }}</div>
    </div>
    <div class="p-2 basis-1/5 flex items-center">
      <div class="flex space-x-2 items-center">
        <CommonTokenIcon v-if="market.baseToken" :token="market.baseToken" />
        <p class="font-semibold">{{ market.ticker }}</p>
      </div>
    </div>
    <div class="p-2 flex-1 text-right space-x-2">
      <span
        :class="{
          'text-green-500': total.gte(0),
          'text-red-500': total.lt(0)
        }"
      >
        {{ totalToString }}
      </span>

      <span class="text-gray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </div>
  </div>
</template>
