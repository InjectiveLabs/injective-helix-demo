<script lang="ts" setup>
useHead({
  bodyAttrs: {
    class: 'dark:bg-[#00001A]'
  }
})
</script>

<template>
  <div>
    <PartialsHomeGradientBg />

    <div class="max-w-7xl mx-auto w-full px-6 xs:px-8 lg:px-12 relative z-[3]">
      <PartialsHomeSectionsHero />
      <PartialsHomeSectionsBuiltForTheComunity />

      <!-- <PartialsHomeSectionsGettingStarted class="mb-16" /> -->

      <PartialsHomeSectionsOverview />

      <PartialsHomeAnnouncements />
      <PartialsHomeNewsletter />
    </div>
  </div>
</template>
