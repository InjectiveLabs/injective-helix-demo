<template>
  <nav class="block flex-1 md:flex">
    <v-nav-item-dummy @click.stop="$root.$emit('toggle-market-slideout')">
      {{ $t('markets') }}
    </v-nav-item-dummy>
    <v-nav-item v-if="isUserWalletConnected" :to="{ name: 'portfolio' }">
      {{ $t('Portfolio') }}
    </v-nav-item>
    <v-nav-item v-if="isUserWalletConnected" :to="{ name: 'history' }">
      {{ $t('History') }}
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

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
