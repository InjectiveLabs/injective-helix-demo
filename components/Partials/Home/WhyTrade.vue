<template>
  <div class="text-gray-775">
    <div
      class="font-semibold text-2xl sm:text-3xl text-gray-775 text-left sm:text-center mt-10 sm:mt-[120px] mb-4 sm:mb-[40px]"
    >
      {{ $t('home.whyTradeOnHelix') }}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12">
      <div class="sm:mt-[14px] lg:mt-5">
        <div class="mb-4">
          <img class="w-full" src="svg/why-trade-on-helix-01.svg" alt="" />
        </div>
        <div class="font-semibold text-xl mb-4">
          {{ $t('home.decentralizedWithAdvancedTypeOrders') }}
        </div>
        <div class="font-medium text-base mb-4 sm:mb-0">
          {{ $t('home.enjoySpotTrading') }}
        </div>
      </div>
      <div class="sm:mt-[9px] lg:mt-3">
        <div class="mb-4">
          <img class="w-full" src="svg/why-trade-on-helix-02.svg" alt="" />
        </div>
        <div class="font-semibold text-xl mb-4">
          {{ $t('home.lowFees') }}
        </div>
        <div class="font-medium text-base mb-4">
          {{ $t('home.zeroGasFees') }}
        </div>
      </div>
      <div>
        <div class="mb-4">
          <img class="w-full" src="svg/why-trade-on-helix-03.svg" alt="" />
        </div>
        <div class="font-semibold text-xl mb-4">
          {{ $t('home.crossChainAssets') }}
        </div>
        <div class="font-medium text-base">
          {{ $t('home.seamlesslyTransferAssets') }}
        </div>
      </div>
    </div>
  </div>
</template>
