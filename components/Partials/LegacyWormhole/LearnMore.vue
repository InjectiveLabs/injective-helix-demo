<script lang="ts" setup>
const WORMHOLE_MIGRATION_BLOG =
  'https://blog.injective.com/injective-bridge-ionic-upgrade'
</script>

<template>
  <NuxtLink
    :to="WORMHOLE_MIGRATION_BLOG"
    target="_blank"
    class="hover:text-gray-500 underline whitespace-nowrap"
  >
    {{ $t('common.legacy.learnMore') }}
  </NuxtLink>
</template>
