<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
</script>

<template>
  <div
    class="relative z-10 py-10 px-8 lg:px-16 bg-[#131620] rounded-3xl overflow-hidden max-lg:mt-24 max-lg:max-w-[500px] max-lg:mx-auto"
  >
    <div class="lg:max-w-[470px] max-lg:mb-8">
      <img
        alt="Helix"
        class="w-12 lg:w-20"
        src="/images/home/helix-white.svg"
      />

      <h4
        class="mt-10 mb-10 lg:mb-14 text-2xl lg:text-[40px] font-poppins font-bold"
      >
        {{ $t('home.mobile.title') }}
      </h4>

      <div class="flex items-center gap-5 lg:gap-6 mb-4">
        <div class="relative flex items-center">
          <span
            class="absolute size-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full"
          />
          <UIcon
            :name="NuxtUiIcons.CheckmarkCircle2"
            class="size-12 lg:size-14 bg-blue-450"
          />
        </div>
        <p class="text-lg lg:text-2xl font-semibold">
          {{ $t('home.mobile.usp1') }}
        </p>
      </div>

      <div class="flex items-center gap-5 lg:gap-6">
        <div class="relative flex items-center">
          <span
            class="absolute size-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full"
          />
          <UIcon
            :name="NuxtUiIcons.CheckmarkCircle2"
            class="size-12 lg:size-14 bg-blue-450"
          />
        </div>
        <p class="text-lg lg:text-2xl font-semibold">
          {{ $t('home.mobile.usp2') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-4 lg:gap-6 mt-16 lg:mt-12">
        <a
          target="_blank"
          href="https://apps.apple.com/us/app/helix-trade-with-control/id6737353178"
        >
          <img
            class="h-11 lg:h-12"
            alt="Apple App Store"
            src="/images/home/app-store.svg"
          />
        </a>
        <a
          target="_blank"
          href="https://play.google.com/store/apps/details?id=com.injectivelabs.helixmobile"
        >
          <img
            class="h-11 lg:h-12"
            alt="Google Play"
            src="/images/home/google-play.svg"
          />
        </a>
      </div>
    </div>

    <img
      alt="Helix Mobile"
      src="/images/home/helix-mobile.webp"
      class="w-full max-lg:max-w-96 lg:w-[450px] xl:w-[550px] lg:absolute lg:-bottom-2 lg:right-2 max-lg:-mb-12 max-lg:mx-auto"
    />
  </div>
</template>

<style scoped>
.helix-logo {
  path {
    fill: #fff;
  }
}
</style>
