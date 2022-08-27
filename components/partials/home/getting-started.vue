<template>
  <div class="text-helixGray-900 sm:mb-[144px] mb-10">
    <div
      class="font-semibold text-2xl sm-text-3xl text-helixGray-900 text-left sm:text-center mt-16 sm:mt-[120px] mb-6"
    >
      {{ $t('home.getStarted') }}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="order-1 md:order-2 md:col-span-6">
        <img src="images/video.svg" alt="Getting started video" />
      </div>
      <div class="md:col-span-6 flex flex-col gap-6 font-medium">
        <div class="flex items-center gap-4 shadow-helixLight h-[80px]">
          <IconCircleOne class="ml-6" /><span>{{
            $t('home.bridgeToInjective')
          }}</span>
        </div>
        <div
          class="flex items-center gap-4 shadow-helixLight h-[80px] md:ml-6 opacity-50"
        >
          <IconCircleTwo class="ml-6" /><span>{{
            $t('home.transferFromInjective')
          }}</span>
        </div>
        <div
          class="flex items-center gap-4 shadow-helixLight h-[80px] md:ml-12 opacity-50"
        >
          <IconCircleThree class="ml-6" /><span>{{
            $t('home.startTrading')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
