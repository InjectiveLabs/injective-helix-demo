<script setup lang="ts">
import { spotMarketKey } from '@/types'

const market = inject(spotMarketKey)
</script>

<template>
  <div v-if="market" class="space-y-4">
    <div class="flex justify-between items-center">
      <CommonHeaderTooltip v-bind="{ tooltip: $t('sgt.investmentTooltip') }">
        {{ $t('sgt.amount') }}
      </CommonHeaderTooltip>

      <div
        class="flex p-2 items-center space-x-2 text-xs bg-brand-875 rounded-md"
      >
        <CommonTokenIcon is-sm v-bind="{ token: market.baseToken }" />
        <p>{{ market.baseToken.symbol }}</p>
        <span>+</span>
        <CommonTokenIcon is-sm v-bind="{ token: market.quoteToken }" />
        <p>{{ market.quoteToken.symbol }}</p>
      </div>
    </div>

    <AppInputField>
      <template #right>
        <span>{{ market.baseToken.symbol }}</span>
      </template>

      <template #bottom>
        <div class="text-right text-xs text-gray-500">
          {{ $t('sgt.available') }}: 20.00
        </div>
      </template>
    </AppInputField>

    <AppInputField>
      <template #right>
        <span>{{ market.quoteToken.symbol }}</span>
      </template>

      <template #bottom>
        <div class="text-right text-xs text-gray-500">
          {{ $t('sgt.available') }}: 20.00
        </div>
      </template>
    </AppInputField>

    <div>
      <div class="flex justify-between items-center">
        <CommonHeaderTooltip v-bind="{ tooltip: $t('todo') }">
          <span class="text-gray-500">
            {{ $t('sgt.minInvestmentAmount') }}
          </span>
        </CommonHeaderTooltip>
        <p class="text-sm font-mono">$100</p>
      </div>

      <div class="flex justify-between items-center">
        <CommonHeaderTooltip v-bind="{ tooltip: $t('todo') }">
          <span class="text-gray-500">
            {{
              $t('sgt.totalBaseAndQuote', {
                base: market.baseToken.symbol,
                quote: market.quoteToken.symbol
              })
            }}
          </span>
        </CommonHeaderTooltip>
        <p class="text-sm font-mono">>= $100 $</p>
      </div>
    </div>
  </div>
</template>
