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
        :to="{
          name: 'derivatives-derivative',
          params: { derivative: 'btc-usdt-perp' }
        }"
      >
        {{ $t('navigation.trade') }}
      </v-nav-item>
      <v-nav-item :to="{ name: 'trade-and-earn' }">
        {{ $t('navigation.rewards') }}
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

  methods: {
    handleOpenMarketsSlideout() {
      this.$root.$emit('toggle-market-slideout')
      this.$root.$emit('close-sidebar')
    }
  }
})
</script>
