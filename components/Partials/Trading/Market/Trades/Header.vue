<script lang="ts" setup>
import { UiMarketWithToken } from '@/types'

defineProps({
  market: {
    required: true,
    type: Object as PropType<UiMarketWithToken>
  }
})
</script>

<template>
  <div class="h-8 w-full">
    <table class="table market-data">
      <thead>
        <tr>
          <th class="w-1/3 text-right">
            <span>{{ $t('trade.price') }}</span>
            <span
              class="font-semibold text-white uppercase inline-block lg:hidden xl:inline-block"
            >
              {{ market.quoteToken.symbol }}
            </span>
          </th>
          <th class="w-1/3 text-right">
            <span>{{ $t('trade.amount') }}</span>
            <span
              class="font-semibold text-white uppercase inline-block lg:hidden xl:inline-block"
            >
              {{ market.baseToken.symbol }}
            </span>
          </th>
          <th class="w-1/3 text-right">
            <span>{{ $t('trade.time') }}</span>
          </th>
        </tr>
      </thead>
    </table>
  </div>
</template>
