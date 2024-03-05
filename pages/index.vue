<script lang="ts" setup></script>

<template>
  <div>
    <AssetNoticeBanners />
    <AssetKadoBanner />

    <div class="flex flex-col">
      <AppHocLoading is-helix is-loading wrapper-class="h-[500px]" />
      <!-- <AssetHelixLogoLoading class="mb-20" /> -->

      <div class="text-center flex flex-col items-center mb-20">
        <div class="flex items-center space-x-4">
          <AssetLogo class="h-16 w-16" />
          <h1 class="font-semibold text-7xl">HELIX</h1>
        </div>

        <p class="text-gray-400">The Premiere Decentralized Exchange</p>
      </div>
    </div>

    <!-- <div class="bg-white">
      <PartialsHomeHero />
      <div class="h-full w-full flex flex-wrap pb-4">
        <div class="container">
          <div class="w-full mx-auto xl:w-4/5">
            <PartialsHomeAnnouncements />
            <PartialsHomeMarkets class="mt-8 sm:mt-16" />
            <PartialsHomeWhyTrade />
          </div>
        </div>
      </div>
      <PartialsHomeFooterCta />
    </div>
     -->
  </div>
</template>
