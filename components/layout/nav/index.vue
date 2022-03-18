<template>
  <div>
    <nav class="block flex-1 lg:flex">
      <v-nav-item :to="{ name: 'index' }" class="block lg:hidden">
        {{ $t('navigation.home') }}
      </v-nav-item>
      <v-nav-item-dummy @click.stop="handleOpenMarketsSlideout">
        {{ $t('trade.markets') }}
      </v-nav-item-dummy>
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
        data-cy="nav-portfolio-link"
        :to="{ name: 'portfolio' }"
      >
        {{ $t('navigation.portfolio') }}
      </v-nav-item>
      <v-nav-item
        v-if="isUserWalletConnected"
        class="block lg:hidden"
        data-cy="nav-activity-link"
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
import VNavItemDummy from './item-dummy.vue'

export default Vue.extend({
  components: {
    VNavItem,
    VNavItemDummy
  },

  data() {
    return {
      //
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  methods: {
    handleOpenMarketsSlideout() {
      this.$root.$emit('toggle-market-slideout')
      this.$root.$emit('close-sidebar')
    }
  }
})
</script>
