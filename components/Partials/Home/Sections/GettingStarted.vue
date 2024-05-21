<script lang="ts" setup>
import { INJ_LOGO_URL } from '@shared/utils/constant'
import { getBridgeUrl } from '@/app/utils/network'
</script>

<template>
  <div>
    <h1
      class="text-xl lg:text-3xl whitespace-pre-wrap text-center font-semibold lg:my-20 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
    >
      {{ $t('home.gettingStarted.title') }}
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="max-lg:mx-auto lg:ml-auto lg:pr-28">
        <img src="/images/home/gettingStarted.svg" />
      </div>

      <div class="text-gray-400 max-lg:max-w-[90%] max-lg:mx-auto">
        <h2 class="text-2xl font-semibold mb-4 text-white">
          {{ $t('home.gettingStarted.description') }}
        </h2>
        <p class="text-base mb-4 leading-5">
          {{ $t('home.gettingStarted.description2') }}
        </p>

        <div class="flex items-center pl-3 gap-2 mb-8">
          <img :src="INJ_LOGO_URL" class="h-6 w-6 min-w-6" />
          <p>{{ $t('home.gettingStarted.gasRequirement') }}</p>
        </div>

        <div class="mb-10">
          <p class="mb-4">{{ $t('home.gettingStarted.steps') }}</p>
          <p>1. {{ $t('home.gettingStarted.step1') }}</p>
          <p>2. {{ $t('home.gettingStarted.step2') }}</p>
          <p>3. {{ $t('home.gettingStarted.step3') }}</p>
          <p>4. {{ $t('home.gettingStarted.step4') }}</p>
        </div>

        <NuxtLink :to="getBridgeUrl()" target="_blank">
          <AppButton class="lg:py-4">
            <span class="text-white">{{ $t('home.gettingStarted.cta') }}</span>
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
