<script setup lang="ts">
const {
  pnl,
  market,
  createdAt,
  pnltoString,
  percentagePnl,
  durationFormatted,
  upperBoundtoString,
  lowerBoundtoString,
  creationBaseQuantity,
  creationQuoteQuantity,
  creationExecutionPriceToString
} = useActiveGridStrategy()
</script>

<template>
  <div class="divide-y-0">
    <div class="flex items-center justify-between mb-2">
      <p class="font-bold text-lg">{{ $t('sgt.gridDetails') }}</p>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full bg-green-500 mr-2" />
        <p>Running</p>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.timeCreated') }}</p>
      <p class="text-sm">{{ createdAt }}</p>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.duration') }}</p>
      <p class="text-sm">{{ durationFormatted }}</p>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.priceRange') }}</p>
      <div class="text-right text-sm">
        <p>{{ lowerBoundtoString }} {{ market?.quoteToken.symbol }}</p>
        <p>{{ upperBoundtoString }} {{ market?.quoteToken.symbol }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>Initial Entry Price</span>
        <AppTooltip
          :content="'The initial entry price is the price at which the smart contract places the first order, setting the baseline for rebalancing your INJ and USDT portfolio to kickstart the strategy.'"
        />
      </p>
      <p class="text-sm">
        {{ creationExecutionPriceToString }} {{ market?.quoteToken.symbol }}
      </p>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm flex space-x-2">
        <span>{{ $t('sgt.investment') }}</span>
        <AppTooltip
          :content="'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.'"
        />
      </p>
      <div class="text-right text-sm">
        <p>
          {{ creationBaseQuantity.toFixed(2) }} {{ market?.baseToken.symbol }}
        </p>
        <p>
          {{ creationQuoteQuantity.toFixed(2) }} {{ market?.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <div class="flex justify-between">
      <p class="text-gray-400 text-sm">{{ $t('sgt.totalProfit') }}</p>
      <div
        class="text-right font-bold text-sm"
        :class="[pnl.isPositive() ? 'text-green-500' : 'text-red-500']"
      >
        <p>{{ pnltoString }} {{ market?.quoteToken.symbol }}</p>
        <p>{{ percentagePnl }} %</p>
      </div>
    </div>
  </div>
</template>
