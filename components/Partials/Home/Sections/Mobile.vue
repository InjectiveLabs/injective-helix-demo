<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import {
  HELIX_APP_STORE_LINK,
  HELIX_PLAY_STORE_LINK
} from '@/app/data/marketInfo'
</script>

<template>
  <div id="mobile-section" class="relative z-10 max-lg:mt-28 lg:py-20">
    <h4 class="text-2xl lg:text-5xl mb-8 font-semibold text-center">
      {{ $t('home.mobile.title') }}
    </h4>

    <div
      class="relative py-8 px-6 sm:p-4 sm:pl-6 lg:px-10 bg-[#141620] flex items-center gap-4 max-sm:flex-col max-lg:rounded-xl overflow-hidden"
    >
      <div class="flex-1 max-lg:mb-8">
        <h6 class="text-xl lg:text-3xl font-semibold">
          {{ $t('home.mobile.downloadHelixMobile') }}
        </h6>

        <div class="flex items-center gap-5 lg:gap-6 mt-6 sm:mt-8 lg:mt-12">
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

        <div class="flex items-center gap-5 lg:gap-6 mt-6 sm:mt-8 lg:mt-12">
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

        <div class="flex flex-wrap gap-4 lg:gap-6 mt-12 sm:mt-14">
          <a target="_blank" :href="HELIX_APP_STORE_LINK">
            <img
              class="h-11 lg:h-12"
              alt="Apple App Store"
              src="/images/home/app-store.svg"
            />
          </a>
          <a target="_blank" :href="HELIX_PLAY_STORE_LINK">
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
        class="w-full sm:w-64 md:w-80 lg:w-[400px] max-w-[400px] max-sm:-mb-24"
      />
    </div>
  </div>
</template>

<style scoped>
.helix-logo {
  path {
    fill: #fff;
  }
}
</style>
