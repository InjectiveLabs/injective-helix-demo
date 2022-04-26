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
      <v-nav-item-dummy
        id="rewards-dropdown"
        class="hidden lg:block"
        @mouseenter.native="handleShowDropdown"
        @mouseleave.native="handleHideDropdown"
        @focus.native="handleShowDropdown"
        @blur.native="handleHideDropdown"
      >
        {{ $t('navigation.rewards') }}
      </v-nav-item-dummy>
      <v-nav-item class="block lg:hidden" :to="{ name: 'trade-and-earn' }">
        {{ $t('navigation.rewards') }}
      </v-nav-item>
      <a
        href="https://dmm.injective.network/"
        target="_blank"
        class="lg:hidden"
      >
        <v-nav-item-dummy>{{ $t('navigation.dmmProgram') }}</v-nav-item-dummy>
      </a>
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

    <VPopperBox
      ref="popper-rewards-dropdown"
      class="popper rounded-lg flex flex-col flex-wrap text-xs absolute w-80 xs:w-96"
      :class="[isMarketPage ? 'bg-gray-900' : 'bg-gray-800']"
      binding-element="#rewards-dropdown"
    >
      <nuxt-link
        :to="{ name: 'trade-and-earn' }"
        :class="[isMarketPage ? 'bg-gray-900' : 'bg-gray-800']"
        class="p-6 block rounded-t-lg group hover:bg-gray-700 relative z-10"
      >
        <p
          class="font-semibold tracking-widest uppercase text-sm text-gray-200 group-hover:text-gray-100"
        >
          {{ $t('navigation.tradeAndEarn') }}
        </p>
        <p
          class="text-sm leading-6 text-gray-500 group-hover:text-gray-100 mt-3"
        >
          {{ $t('navigation.tradeAndEarnDescription') }}
        </p>
      </nuxt-link>
      <a
        href="https://dmm.injective.network/"
        target="_blank"
        class="p-6 block rounded-b-lg group hover:bg-gray-700"
      >
        <p
          class="font-semibold tracking-widest uppercase text-sm text-gray-200 group-hover:text-gray-100 flex items-center"
        >
          <span>{{ $t('navigation.dmmProgram') }}</span>
          <v-icon-external-link-arrow class="w-auto h-2 ml-2" />
        </p>
        <p
          class="text-sm leading-6 text-gray-500 group-hover:text-gray-100 mt-3"
        >
          {{ $t('navigation.dmmProgramDescription') }}
        </p>
      </a>
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

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    isMarketPage(): boolean {
      const { $route } = this

      return ['spot-spot', 'derivatives-derivative'].includes(
        $route.name as string
      )
    },

    $popper(): any {
      return this.$refs['popper-rewards-dropdown']
    }
  },

  methods: {
    handleShowDropdown() {
      if (this.$popper) {
        this.$popper.showDropdown()
      }
    },

    handleHideDropdown() {
      if (this.$popper) {
        this.$popper.hideDropdown()
      }
    }
  }
})
</script>
