<script lang="ts" setup></script>

<template>
  <div>
    <PartialsHomeGradientBg />
    <AssetNoticeBanners class="relative z-[2]" />
    <!-- hide for launch -->
    <!-- <AssetKadoBanner /> -->

    <div class="max-w-7xl mx-auto w-full px-2 relative z-[3]">
      <PartialsHomeSectionsHero />
      <PartialsHomeSectionsBuiltForTheComunity />

      <!-- <PartialsHomeSectionsGettingStarted class="mb-16" /> -->

      <PartialsHomeSectionsOverview class="mb-16" />
      <PartialsHomeAnnouncements />
      <PartialsHomeNewsletter />
    </div>
  </div>
</template>
