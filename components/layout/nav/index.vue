<template>
  <nav class="block flex-1 lg:flex">
    <v-nav-item :to="{ name: 'index' }" class="block lg:hidden">
      {{ $t('home') }}
    </v-nav-item>
    <v-nav-item-dummy @click.stop="handleOpenMarketsSlideout">
      {{ $t('markets') }}
    </v-nav-item-dummy>
    <v-nav-item :to="{ name: 'portfolio' }">
      {{ $t('Portfolio') }}
    </v-nav-item>
    <v-nav-item :to="{ name: 'history' }">
      {{ $t('History') }}
    </v-nav-item>
    <v-nav-item :to="{ name: 'wallet' }">
      {{ $t('Wallet') }}
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
  },

  methods: {
    handleOpenMarketsSlideout() {
      this.$root.$emit('toggle-market-slideout')
      this.$root.$emit('close-sidebar')
    }
  }
})
</script>
