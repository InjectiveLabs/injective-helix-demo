<script setup lang="ts">
//
</script>

<template>
  <header class="w-full z-50 bg-brand-900">
    <div class="flex border-b">
      <NuxtLink to="/" class="px-6 border-r flex justify-center items-center">
        <AssetLogo class="h-6 w-10 lg:h-10 lg:w-10 aspect-square" alt="Helix" />
      </NuxtLink>
      <LayoutNavbarMenu />

      <div class="flex-1" />

      <LayoutNavbarMenuWallet />
    </div>
  </header>
</template>
