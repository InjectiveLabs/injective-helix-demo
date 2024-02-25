<script setup lang="ts">
//
</script>

<template>
  <div class="pt-20">
    <div class="max-w-xl mx-auto">
      <div
        class="bg-[url('/svg/ethdenver2024.svg')] rounded-xl bg-cover mx-auto text-center py-10 px-4"
      >
        <h1 class="text-xl font-bold">{{ $t('ethdenver.banner') }}</h1>
      </div>

      <div class="text-center my-4 space-y-4">
        <h1 class="text-xl font-semibold">{{ $t('ethdenver.title') }}</h1>
        <h1 class="text-lg">{{ $t('ethdenver.subtitle') }}</h1>
      </div>

      <div class="bg-gray-800 rounded-xl p-8 space-y-4">
        <div class="flex justify-center items-center font-semibold space-x-2">
          <div
            class="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center"
          >
            1
          </div>
          <p>{{ $t('ethdenver.step1') }}</p>
        </div>

        <div class="flex justify-center">
          <AppButton class="bg-blue-500 text-white border-blue-500">
            {{ $t('ethdenver.register') }}
          </AppButton>
        </div>

        <div class="flex justify-center items-center font-semibold space-x-2">
          <div
            class="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center"
          >
            2
          </div>
          <p>{{ $t('ethdenver.step2') }}</p>
        </div>

        <div>
          <div class="flex justify-center">
            <NuxtLink to="/swap">
              <AppButton class="bg-blue-500 text-white border-blue-500">
                {{ $t('ethdenver.goToSwap') }}
              </AppButton>
            </NuxtLink>
          </div>
        </div>

        <div class="flex justify-center items-center font-semibold space-x-2">
          <div
            class="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center"
          >
            3
          </div>
          <p>{{ $t('ethdenver.step3') }}</p>
        </div>
      </div>

      <p class="text-gray-500 text-center mt-8">{{ $t('ethdenver.footer') }}</p>
    </div>
  </div>
</template>
