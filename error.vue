<script setup lang="ts">
function onRedirectHome() {
  navigateTo('/')
}
</script>
<template>
  <div class="w-full min-h-screen bg-coolGray-950 flex flex-col">
    <section class="h-full-flex h-full flex-col justify-center items-center">
      <h2 class="text-3xl font-semibold">{{ $t('notFound404.title') }}</h2>

      <UCard class="mt-6">
        <NuxtLink
          to="/"
          class="pl-6 pr-4 mr-4 flex justify-center items-center cursor-pointer"
        >
          <AssetLogo class="h-24 w-24 aspect-square" alt="Helix" />
        </NuxtLink>

        <p class="mt-12">{{ $t('notFound404.description') }}</p>
        <AppButton class="mt-6 mx-auto" @click="onRedirectHome">
          {{ $t('notFound404.backToHome') }}
        </AppButton>
      </UCard>
    </section>
  </div>
</template>
