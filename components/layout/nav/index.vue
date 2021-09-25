<template>
  <nav class="block flex-1 md:flex">
    <v-nav-item-dummy @click.stop="$root.$emit('toggle-market-slideout')">
      {{ $t('markets') }}
    </v-nav-item-dummy>
    <v-nav-item :to="{ name: 'portfolio' }">
      {{ $t('portfolio') }}
    </v-nav-item>
    <v-nav-item :to="{ name: 'leaderboard' }">
      {{ $t('leaderboard') }}
    </v-nav-item>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import VNavItem from './item.vue'
import VNavItemDummy from './item-dummy.vue'

export default Vue.extend({
  components: {
    VNavItem,
    VNavItemDummy
  }
})
</script>
