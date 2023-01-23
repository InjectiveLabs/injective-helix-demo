<template>
  <div class="container py-4 sm:py-10 xl:px-10 relative">
    <div class="w-full mx-auto">
      <div
        class="block md:grid rounded-[20px] p-6 md:p-16 lg:px-6 lg:py-8 2xl:px-20 2xl:py-16 bg-gray-100 bg-cover grid-cols-12 gap-12 items-center bg-hero"
      >
        <PartialsHomeHeroCta class="col-span-12 lg:col-span-6 3xl:col-span-6" />
        <div class="col-span-6 3xl:col-span-6 hidden lg:block lg:mt-6">
          <PartialsHomeCommonMarkets
            is-hero
            class="max-w-lg ml-auto 3xl:mr-10"
          />
        </div>
        <div class="col-span-3 flex gap-2 w-max items-center mt-6 md:mt-0">
          <span class="text-gray-775 text-sm md:text-base">
            {{ $t('home.builtOn') }}
          </span>
          <AssetInjective class="w-20 md:w-28" />
        </div>
      </div>
    </div>
  </div>
</template>
