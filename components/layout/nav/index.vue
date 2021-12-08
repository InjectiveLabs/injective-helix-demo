<template>
  <div>
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
      <v-nav-item class="lg:hidden" :to="{ name: 'trade-and-earn' }">
        {{ $t('dmm.nav.tradingRewards') }}
      </v-nav-item>
      <v-nav-item class="lg:hidden" :to="{ name: 'dedicated-market-making' }">
        {{ $t('dmm.nav.dedicatedMarketMakingRewards') }}
      </v-nav-item>
      <v-nav-item-dummy
        ref="rewards"
        class="hidden lg:block"
        @mouseenter.native="showDropdown"
        @mouseleave.native="hideDropdown"
        @focus.native="showDropdown"
        @blur.native="hideDropdown"
      >
        {{ $t('Rewards') }}
      </v-nav-item-dummy>
      <v-nav-item :to="{ name: 'history' }">
        {{ $t('History') }}
      </v-nav-item>
      <v-nav-item :to="{ name: 'wallet' }">
        {{ $t('Wallet') }}
      </v-nav-item>
    </nav>

    <VPopperBox
      ref="popper"
      class="popper px-4 pt-4 bg-gray-800 rounded-xl flex flex-col flex-wrap text-xs absolute"
      binding-element="rewards"
      :options="popperOption"
    >
      <div>
        <v-nav-item
          :to="{ name: 'trade-and-earn' }"
          class="hover:text-primary-500"
          dense
        >
          {{ $t('dmm.nav.tradingRewards') }}
        </v-nav-item>
        <v-nav-item
          :to="{ name: 'dedicated-market-making' }"
          class="hover:text-primary-500"
          dense
        >
          {{ $t('dmm.nav.dedicatedMarketMakingRewards') }}
        </v-nav-item>
      </div>
    </VPopperBox>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VNavItem from './item.vue'
import VNavItemDummy from './item-dummy.vue'
import VPopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    VNavItem,
    VNavItemDummy,
    VPopperBox
  },

  data() {
    return {
      popperOption: {
        placement: 'bottom',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      } as Object
    }
  },

  methods: {
    handleOpenMarketsSlideout() {
      this.$root.$emit('toggle-market-slideout')
      this.$root.$emit('close-sidebar')
    },

    showDropdown() {
      // @ts-ignore
      this.$refs.popper.showDropdown()
    },

    hideDropdown() {
      // @ts-ignore
      this.$refs.popper.hideDropdown()
    }
  }
})
</script>
