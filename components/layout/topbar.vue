<template>
  <header
    class="w-full z-1100 flex-shrink-0 flex h-12 lg:h-14 bg-gray-900 items-center"
    :class="{ fixed: isSidebarOpen, relative: !isSidebarOpen }"
  >
    <div
      class="cursor-pointer pl-6 lg:pr-6 lg:border-r flex items-center"
      @click="$router.push({ name: 'index' })"
    >
      <Logo class="w-auto h-6 lg:h-[30px]" alt="Helix" />
    </div>
    <div class="flex-1 px-2 lg:px-6 flex justify-end lg:justify-between">
      <div
        class="relative h-0 -z-10 w-0 opacity-0 lg:h-full lg:z-0 lg:w-full lg:opacity-100 flex items-center"
      >
        <Nav class="hidden lg:block" />
      </div>
      <div class="flex items-center">
        <NavItemDummy
          v-if="isUserWalletConnected && hasNinjaPassCodes"
          class="flex px-0 w-10 items-center justify-center"
          @click="handleShowNinjaPassModal"
        >
          <IconGift class="text-white w-4 h-4" />
        </NavItemDummy>

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
import NavItemDummy from './nav/item-dummy.vue'
import Nav from '~/components/layout/nav/index.vue'
import Logo from '~/components/elements/logo.vue'
import {
  derivativeMarketRouteNames,
  spotMarketRouteNames
} from '~/app/data/market'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    Nav,
    NavItem,
    NavItemDummy,
    UserWallet,
    Logo,
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

    hasNinjaPassCodes(): boolean {
      if (!this.$accessor.ninjapass.codes) {
        return false
      }

      return this.$accessor.ninjapass.codes.length > 0
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
    },

    handleShowNinjaPassModal() {
      this.$accessor.modal.openModal({ type: Modal.NinjaPassWinner })
      this.$confetti.activate()
    }
  }
})
</script>
