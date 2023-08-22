<script setup lang="ts">
const trustedBy = [
  'trustedby/Pyth Logotype_Light.svg',
  'trustedby/wormhole_logo.svg',
  'trustedby/imc_logo.svg',
  'trustedby/anti_capital_logo.png',
  'home-main.svg'
]
</script>

<template>
  <div>
    <p class="mb-4 text-xl">{{ $t('institutional.trustedByTheBest') }}</p>
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 justify-items-center gap-20"
    >
      <img
        v-for="item in trustedBy"
        :key="item"
        :src="`/images/${item}`"
        :alt="item"
        class="lg:w-full h-full object-contain"
      />
    </div>
  </div>
</template>
