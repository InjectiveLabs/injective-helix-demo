<template>
  <div class="container py-4 sm:py-10">
    <div class="w-full mx-auto xl:w-4/5">
      <div
        class="block md:grid rounded-[20px] p-6 md:p-16 bg-gray-100 bg-cover grid-cols-12 gap-12 items-center bg-hero"
      >
        <HeroCTA />
        <div
          class="col-span-7 3xl:col-span-7 4xl:col-span-6 hidden lg:block lg:mt-6"
        >
          <Markets is-hero />
        </div>
        <div class="col-span-3 hidden md:flex gap-2 w-max">
          <span class="text-helixGray-900">{{ $t('home.builtOn') }}</span>
          <InjectiveLogo />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Markets from '~/components/partials/home/common/markets.vue'
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
