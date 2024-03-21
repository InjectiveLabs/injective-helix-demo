<script lang="ts" setup>
// todo: update this when get blog post. also put link directly on the :to and kill the const
const WORMHOLE_MIGRATION_BLOG = 'https://helixapp.com'
</script>

<template>
  <NuxtLink
    :to="WORMHOLE_MIGRATION_BLOG"
    target="_blank"
    class="hover:text-gray-200 underline whitespace-nowrap"
  >
    {{ $t('common.legacy.learnMore') }}
  </NuxtLink>
</template>
