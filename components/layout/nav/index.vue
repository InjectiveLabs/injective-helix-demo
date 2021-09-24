<template>
  <nav class="flex-1">
    <v-nav-item :to="{ name: 'index' }" exact>
      {{ $t('home') }}
    </v-nav-item>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import VNavItem from './item.vue'

export default Vue.extend({
  components: {
    VNavItem
  }
})
</script>
