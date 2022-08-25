<template>
  <div class="text-helixGray-900">
    <div
      class="font-semi-bold text-3xl text-helixGray-900 text-center mt-[120px] mb-[40px]"
    >
      {{ $t('home.whyTradeOnHelix') }}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-4">
        <div class="mb-6">
          <img src="images/orderbook.png" alt="" />
        </div>
        <div class="font-semibold text-2xl mb-4">
          {{ $t('home.decentralizedWithAdvancedTypeOrders') }}
        </div>
        <div class="font-medium text-base">
          {{ $t('home.enjoySpotTrading') }}
        </div>
      </div>
      <div class="md:col-span-4">
        <div class="mb-6">
          <img src="images/low-fees.png" alt="" />
        </div>
        <div class="font-semibold text-2xl mb-4">
          {{ $t('home.lowFees') }}
        </div>
        <div class="font-medium text-base">
          {{ $t('home.zeroGasFees') }}
        </div>
      </div>
      <div class="md:col-span-4">
        <div class="mb-6">
          <img src="images/trade.png" alt="" />
        </div>
        <div class="font-semibold text-2xl mb-4">
          {{ $t('home.crossChainAssets') }}
        </div>
        <div class="font-medium text-base">
          {{ $t('home.seamlesslyTransferAssets') }}
        </div>
      </div>
    </div>
  </div>
</template>
