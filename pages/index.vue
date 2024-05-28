<script lang="ts" setup></script>

<template>
  <div>
    <AssetNoticeBanners />
    <!-- hide for launch -->
    <!-- <AssetKadoBanner /> -->

    <div class="flex flex-col p-4 lg:p-8 max-w-7xl mx-auto w-full">
      <PartialsHomeSectionsHero />
      <PartialsHomeSectionsGettingStarted class="mb-16" />
      <PartialsHomeSectionsOverview class="mb-16" />
      <PartialsHomeAnnouncements />
      <PartialsHomeNewsletter />
    </div>
  </div>
</template>
