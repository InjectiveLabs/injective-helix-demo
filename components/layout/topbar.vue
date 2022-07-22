<template>
  <header
    class="relative z-1100 flex-shrink-0 flex h-12 lg:h-14 bg-gray-900 items-center"
  >
    <div
      class="cursor-pointer pl-6 lg:pr-6 lg:border-r flex items-center"
      @click="$router.push({ name: 'index' })"
    >
      <Logo class="w-auto h-6 lg:h-[30px]" alt="Helix" />
      <LogoText class="block lg:hidden ml-2 h-6 lg:[h-30px]" />
    </div>
    <div class="flex-1 px-2 lg:px-6 flex justify-end lg:justify-between">
      <div
        class="relative h-0 -z-10 w-0 opacity-0 lg:h-full lg:z-0 lg:w-full lg:opacity-100 flex items-center"
      >
        <Nav class="hidden lg:block" />
      </div>
      <div class="flex items-center">
        <NavItem
          v-if="isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-activity-link"
          :to="{ name: 'activity' }"
        >
          {{ $t('navigation.activity') }}
        </NavItem>
        <NavItem
          v-if="isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-portfolio-link"
          :to="{ name: 'portfolio' }"
        >
          {{ $t('navigation.portfolio') }}
        </NavItem>

        <!--
        <div class="hidden xs:flex">
          <NavItemDummy
            v-show="isUserWalletConnected"
            id="dashboard"
            @mouseenter.native="handleShowDropdown"
            @mouseleave.native="handleHideDropdown"
            @focus.native="handleShowDropdown"
            @blur.native="handleHideDropdown"
            @click.native="handleClickOnDashboard"
          >
            {{ $t('navigation.dashboard') }}
          </NavItemDummy>
        </div>

        <PopperBox
          ref="popper-dashboard"
          class="popper px-4 py-4 rounded-lg flex flex-col flex-wrap text-xs absolute w-3xs"
          :class="[isMarketPage ? 'bg-gray-900' : 'bg-gray-800']"
          binding-element="#dashboard"
        >
          <div>
            <NavItem
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
            </NavItem>
            <NavItem
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
            </NavItem>
          </div>
        </PopperBox>
        -->

        <UserWallet
          v-if="isUserWalletConnected && isUserConnectedProcessCompleted"
        />
        <UserWalletConnect v-else @wallet-connected="handleConnectedWallet" />
      </div>
    </div>
    <button
      class="px-4 border-r border-gray-600 text-gray-200 lg:hidden"
      @click.stop="handleClickOnSidebarToggle"
    >
      <template v-if="isSidebarOpen">
        <span class="sr-only">{{ $t('common.close') }}</span>
        <IconClose class="w-6 h-6" />
      </template>
      <template v-else>
        <span class="sr-only">{{ $t('common.open') }}</span>
        <IconMenu class="w-6 h-6" />
      </template>
    </button>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import UserWallet from './wallet/wallet.vue'
import UserWalletConnect from './wallet/connect.vue'
import NavItem from './nav/item.vue'
import Nav from '~/components/layout/nav/index.vue'
import Logo from '~/components/elements/logo.vue'
import LogoText from '~/components/elements/logo-text.vue'
import {
  derivativeMarketRouteNames,
  spotMarketRouteNames
} from '~/app/data/market'
// import NavItemDummy from './nav/item-dummy.vue'
// import PopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    Nav,
    NavItem,
    UserWallet,
    Logo,
    LogoText,
    // NavItemDummy,
    // PopperBox,
    UserWalletConnect
  },

  props: {
    isSidebarOpen: {
      required: true,
      default: false,
      type: Boolean
    }
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
      const { isSidebarOpen } = this

      this.$emit(isSidebarOpen ? 'sidebar-closed' : 'sidebar-opened')
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
