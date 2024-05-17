<script setup lang="ts">
//
</script>

<template>
  <div class="text-center mb-20 mt-10 md:mt-14">
    <div class="flex flex-col items-center">
      <div class="flex items-center space-x-4">
        <AssetLogo class="h-12 w-12" />
        <h1 class="font-light text-4xl">HELIX</h1>
      </div>

      <div class="max-w-3xl space-y-4 my-4`">
        <h1
          class="text-2xl lg:text-6xl font-semibold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent py-2"
        >
          {{ $t('home.title') }}
        </h1>

        <p class="text-sm lg:text-xl text-gray-200 font-light">
          {{ $t('home.subtitle') }}
        </p>

        <div
          class="flex max-lg:flex-col max-lg:space-y-2 justify-center lg:space-x-2 py-4"
        >
          <AppButton class="lg:py-4">{{ $t('home.startTrading') }}</AppButton>
          <AppButton class="lg:py-4" variant="primary-outline">
            {{ $t('home.depositCrypto') }}
          </AppButton>
        </div>
      </div>
    </div>

    <div class="relative">
      <div
        class="absolute bottom-0 -left-[250px] blur-[10rem] bg-blue-300/20 w-[200px] h-[200px] md:w-[500px] md:h-[500px] rounded-full"
      ></div>
      <img
        src="/images/hero_image.png"
        class="w-full relative aspect-[1.3] object-contain"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 w-full gap-4 my-4">
      <div class="">
        <h2>{{ $t('home.tradingVolume') }}</h2>
        <p class="text-2xl font-semibold">$ 432,452,322</p>
      </div>

      <div class="">
        <h2>{{ $t('home.tradingVolume') }}</h2>
        <p class="text-2xl font-semibold">$ 432,452,322</p>
      </div>

      <div class="">
        <h2>{{ $t('home.tradingVolume') }}</h2>
        <p class="text-2xl font-semibold">$ 432,452,322</p>
      </div>
    </div>
  </div>
</template>
