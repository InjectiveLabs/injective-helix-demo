<script lang="ts" setup>
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
      class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 items-center"
    >
      <img
        v-for="item in trustedBy"
        :key="item"
        :src="`/images/${item}`"
        :alt="item"
        class="p-6 max-lg:w-[90%] mx-auto object-contain"
      />
    </div>
  </div>
</template>
