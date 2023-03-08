<script lang="ts" setup></script>

<template>
  <div>
    <AssetNoticeBanners />
    <AssetKadoBanner />

    <div class="bg-white">
      <PartialsHomeHero />
      <div class="h-full w-full flex flex-wrap pb-4">
        <div class="container">
          <div class="w-full mx-auto xl:w-4/5">
            <PartialsHomeAnnouncements />
            <PartialsHomeMarkets class="mt-8 sm:mt-16" />
            <PartialsHomeWhyTrade />
            <PartialsHomeGettingStarted />
          </div>
        </div>
      </div>
      <PartialsHomeFooterCta />
    </div>
  </div>
</template>
