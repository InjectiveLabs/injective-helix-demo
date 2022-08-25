<template>
  <div class="text-helixGray-900">
    <div
      class="font-semi-bold text-3xl text-helixGray-900 text-center mt-[120px] mb-[40px]"
    >
      {{ $t('home.getStarted') }}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-6">
        <img src="images/video.svg" alt="Getting started video" />
      </div>
      <div class="md:col-span-6 flex flex-col gap-6">
        <div class="flex items-center gap-4 shadow-helixLight h-[80px]">
          <IconCircleOne class="ml-6" /><span>{{
            $t('home.bridgeToInjective')
          }}</span>
        </div>
        <div
          class="flex items-center gap-4 shadow-helixLight h-[80px] ml-6 opacity-50"
        >
          <IconCircleTwo class="ml-6" /><span>{{
            $t('home.transferFromInjective')
          }}</span>
        </div>
        <div
          class="flex items-center gap-4 shadow-helixLight h-[80px] ml-12 opacity-50"
        >
          <IconCircleThree class="ml-6" /><span>{{
            $t('home.startTrading')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
