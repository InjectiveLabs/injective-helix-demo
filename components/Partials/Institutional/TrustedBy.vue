<script setup lang="ts">
const trustedBy = [
  'jump.svg',
  'cumberland.svg',
  'bh_digital.svg',
  'galaxy.svg',
  'trm.svg'
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
        :src="`/images/trustedby/${item}`"
        :alt="item"
        class="lg:w-full h-full object-contain"
      />
    </div>
  </div>
</template>
