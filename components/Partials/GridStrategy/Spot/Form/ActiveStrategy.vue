<script setup lang="ts">
const { upperBoundtoString, lowerBoundtoString, market, investmentToString } =
  useActiveGridStrategy()
</script>

<template>
  <PartialsGridStrategySpotFormHeader />

  <p class="text-sm font-semibold text-gray-200">1. Price</p>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <AppInputNumeric
        :value="lowerBoundtoString"
        placeholder="0.00"
        class="text-right"
      >
        <template #context>
          <p class="text-xs font-semibold text-gray-200 mb-2">
            {{ $t('sgt.lowerPrice') }}
          </p>
        </template>

        <template #addon>
          <span v-if="market">
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppInputNumeric>
    </div>

    <div>
      <AppInputNumeric
        :value="upperBoundtoString"
        placeholder="0.00"
        readonly
        class="text-right"
      >
        <template #context>
          <p class="text-xs font-semibold text-gray-200 mb-2">
            {{ $t('sgt.upperPrice') }}
          </p>
        </template>

        <template #addon>
          <span v-if="market">
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppInputNumeric>
    </div>
  </div>

  <div>
    <AppInputNumeric value="10" placeholder="0.00" readonly class="text-right">
      <template #context>
        <p class="text-sm font-semibold text-gray-200 mb-4">
          2. Number Of Grids
        </p>
      </template>
    </AppInputNumeric>
  </div>

  <div class="flex justify-between items-center border-b pb-4 text-gray-500">
    <div class="flex items-center space-x-2">
      <p>{{ $t('sgt.profitGrid') }}</p>
      <AppTooltip :content="$t('sgt.gridIntervalTooltip')" />
    </div>
  </div>

  <div class="mb-4">
    <div class="flex items-center space-x-2 pb-4">
      <span class="text-sm font-semibold text-gray-200">3. Investment</span>
      <AppTooltip :content="$t('sgt.investmentTooltip')" />
    </div>

    <div>
      <AppInputNumeric
        :value="investmentToString"
        placeholder="0.00"
        class="text-right"
      >
        <template #addon>
          <span v-if="market">
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppInputNumeric>
    </div>
  </div>
</template>
