<script lang="ts" setup></script>

<template>
  <div>
    <div class="bg-gray-1000">
      <PartialsHomeHero />
      <div class="h-full w-full flex flex-wrap pb-4">
        <div class="container">
          <div class="w-full mx-auto xl:w-4/5">
            <PartialsHomeMarkets class="mt-8 sm:mt-16" />
            <PartialsHomeWhyTrade />
          </div>
        </div>
      </div>
      <PartialsHomeFooterCta />
    </div>
  </div>
</template>
