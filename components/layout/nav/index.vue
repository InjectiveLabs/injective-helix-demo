<template>
  <div>
    <nav class="block flex-1 lg:flex">
      <v-nav-item :to="{ name: 'index' }" class="block lg:hidden">
        {{ $t('navigation.home') }}
      </v-nav-item>
      <v-nav-item :to="{ name: 'markets' }" class="block">
        {{ $t('trade.markets') }}
      </v-nav-item>
      <v-nav-item
        class="block"
        :to="{
          name: 'derivatives-derivative',
          params: { derivative: 'btc-usdt-perp' }
        }"
      >
        {{ $t('navigation.trade') }}
      </v-nav-item>
      <v-nav-item class="block" :to="{ name: 'trade-and-earn' }">
        {{ $t('navigation.rewards') }}
      </v-nav-item>
      <v-nav-item
        v-if="isUserWalletConnected"
        class="block lg:hidden"
        :to="{ name: 'portfolio' }"
      >
        {{ $t('navigation.portfolio') }}
      </v-nav-item>
      <v-nav-item
        v-if="isUserWalletConnected"
        class="block lg:hidden"
        :to="{ name: 'activity' }"
      >
        {{ $t('navigation.activity') }}
      </v-nav-item>
    </nav>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VNavItem from './item.vue'

export default Vue.extend({
  components: {
    VNavItem
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
