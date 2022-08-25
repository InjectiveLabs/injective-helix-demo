<template>
  <div class="container py-10">
    <div class="w-full mx-auto xl:w-4/5">
      <div
        class="rounded-[20px] p-16 bg-gray-100 bg-cover grid grid-cols-12 gap-12 align-center"
        style="background-image: url('/svg/helix-hero-bg.svg')"
      >
        <HeroCTA />
        <div class="col-span-8 3xl:col-span-7 4xl:col-span-6 hidden lg:block">
          <Markets is-hero />
        </div>
        <div class="col-span-3 flex gap-2">
          <span class="text-helixGray-900">{{ $t('home.builtOn') }}</span>
          <InjectiveLogo />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Markets from '~/components/partials/home/markets/markets.vue'
import HeroCTA from '~/components/partials/home/hero/hero-cta.vue'
import InjectiveLogo from '~/components/icons/injective-logo.vue'

export default Vue.extend({
  components: {
    HeroCTA,
    InjectiveLogo,
    Markets
  }
})
</script>
