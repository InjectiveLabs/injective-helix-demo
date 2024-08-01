<script lang="ts" setup>
definePageMeta({
  layout: 'blank'
})
</script>

<template>
  <main class="flex flex-col h-screen w-full">
    <div class="container flex flex-col h-full p-4 sm:p-20">
      <div
        class="h-[calc(100%-20px)] flex flex-col justify-center items-center"
      >
        <div class="flex items-center justify-center mx-auto mb-20">
          <AssetLogo class="h-10 w-10 mr-2" alt="Helix" />
          <AssetLogoText class="h-8 text-white" />
        </div>

        <h1 class="text-white font-bold text-3xl text-center">
          {{ $t('maintenance_header') }}
        </h1>

        <h2 class="text-white text-xl text-center my-4 max-w-xl">
          {{ $t('maintenance_body') }}
        </h2>

        <!-- <div class="text-center">
          <NuxtLink
            to="https://status.exchange.injective.network/"
            target="_blank"
          >
            <AppButton is-xl class="rounded-full text-blue-900 bg-blue-500">
              <span class="font-semibold">
                {{ $t('maintenance_button') }}
              </span>
            </AppButton>
          </NuxtLink>
        </div> -->
      </div>
    </div>
  </main>
</template>
