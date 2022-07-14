<template>
  <header
    class="relative z-1100 flex-shrink-0 flex h-14 bg-black shadow-top-bar-dark"
  >
    <button
      class="px-4 border-r border-gray-600 text-gray-200 lg:hidden"
      @click.stop="handleClickOnSidebarToggle"
    >
      <span class="sr-only">{{ $t('common.open') }}</span>
      <IconMenu class="w-6 h-6" />
    </button>
    <div class="flex-1 px-2 lg:px-8 flex justify-end lg:justify-between">
      <div
        class="relative h-0 -z-10 w-0 opacity-0 lg:h-full lg:z-0 lg:w-full lg:opacity-100 flex items-center"
      >
        <div
          class="py-px pr-8 border-r cursor-pointer"
          @click="$router.push({ name: 'index' })"
        >
          <v-logo class="w-auto h-[30px]" alt="InjectivePro" />
        </div>
        <v-nav class="hidden lg:block ml-2" />
      </div>
      <div class="py-3 flex">
        <v-nav-item
          v-if="isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-activity-link"
          :to="{ name: 'activity' }"
        >
          {{ $t('navigation.activity') }}
        </v-nav-item>
        <v-nav-item
          v-if="isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-portfolio-link"
          :to="{ name: 'portfolio' }"
        >
          {{ $t('navigation.portfolio') }}
        </v-nav-item>

        <!--
        <div class="hidden xs:flex">
          <v-nav-item-dummy
            v-show="isUserWalletConnected"
            id="dashboard"
            @mouseenter.native="handleShowDropdown"
            @mouseleave.native="handleHideDropdown"
            @focus.native="handleShowDropdown"
            @blur.native="handleHideDropdown"
            @click.native="handleClickOnDashboard"
          >
            {{ $t('navigation.dashboard') }}
          </v-nav-item-dummy>
        </div>

        <VPopperBox
          ref="popper-dashboard"
          class="popper px-4 py-4 rounded-lg flex flex-col flex-wrap text-xs absolute w-3xs"
          :class="[isMarketPage ? 'bg-gray-900' : 'bg-gray-800']"
          binding-element="#dashboard"
        >
          <div>
            <v-nav-item
              :to="{ name: 'portfolio' }"
              class="hover:text-primary-500 inline-block hover:bg-transparent w-full mb-2"
              dense
            >
              <span class="flex items-center">
                <span
                  class="w-8 h-8 rounded-full bg-gray-1000 flex items-center justify-center mr-2"
                >
                  <IconWallet class="w-4 h-4" />
                </span>
                {{ $t('navigation.portfolio') }}
              </span>
            </v-nav-item>
            <v-nav-item
              :to="{ name: 'activity' }"
              class="hover:text-primary-500 inline-block hover:bg-transparent w-full"
              dense
            >
              <span class="flex items-center">
                <span
                  class="w-8 h-8 rounded-full bg-gray-1000 flex items-center justify-center mr-2"
                >
                  <IconMenuAlt class="w-4 h-4" />
                </span>
                {{ $t('navigation.activity') }}
              </span>
            </v-nav-item>
          </div>
        </VPopperBox>
        -->

        <v-user-wallet
          v-if="isUserWalletConnected && isUserConnectedProcessCompleted"
        />
        <v-user-wallet-connect
          v-else
          @wallet-connected="handleConnectedWallet"
        />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import VUserWallet from './wallet/wallet.vue'
import VUserWalletConnect from './wallet/connect.vue'
import VNavItem from './nav/item.vue'
import VNav from '~/components/layout/nav/index.vue'
import VLogo from '~/components/elements/logo.vue'
import {
  derivativeMarketRouteNames,
  spotMarketRouteNames
} from '~/app/data/market'
// import VNavItemDummy from './nav/item-dummy.vue'
// import VPopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    VNav,
    VNavItem,
    VUserWallet,
    VLogo,
    // VNavItemDummy,
    // VPopperBox,
    VUserWalletConnect
  },

  data() {
    return {
      isUserConnectedProcessCompleted: false
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    isMarketPage(): boolean {
      const { $route } = this

      return [...derivativeMarketRouteNames, ...spotMarketRouteNames].includes(
        $route.name as string
      )
    },

    $popper(): any {
      return this.$refs['popper-dashboard']
    }
  },

  watch: {
    isUserWalletConnected(newIsUserWalletConnected) {
      if (!newIsUserWalletConnected) {
        this.isUserConnectedProcessCompleted = false
      }
    }
  },

  mounted() {
    if (this.isUserWalletConnected) {
      this.isUserConnectedProcessCompleted = true
    }
  },

  methods: {
    handleClickOnSidebarToggle() {
      this.$emit('sidebar-opened')
    },

    handleClickOnDashboard() {
      if (this.isUserWalletConnected) {
        this.$router.push({ name: 'portfolio' })
      }
    },

    handleConnectedWallet() {
      this.isUserConnectedProcessCompleted = true
    },

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
