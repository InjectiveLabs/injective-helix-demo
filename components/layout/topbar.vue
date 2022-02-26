<template>
  <header
    class="relative z-1100 flex-shrink-0 flex h-14 bg-black shadow-top-bar-dark"
  >
    <button
      class="px-4 border-r border-gray-600 text-gray-200 lg:hidden"
      @click.stop="handleClickOnSidebarToggle"
    >
      <span class="sr-only">{{ $t('open') }}</span>
      <v-icon-menu class="w-6 h-6" />
    </button>
    <div class="flex-1 px-2 lg:px-8 flex justify-end lg:justify-between">
      <div class="w-0 opacity-0 lg:w-full lg:opacity-100 flex items-center">
        <div
          class="py-px pr-8 border-r cursor-pointer"
          @click="$router.push({ name: 'index' })"
        >
          <v-logo class="w-auto h-[30px]" alt="Injective1111" />
        </div>
        <v-nav class="ml-2" />
      </div>
      <div class="flex py-2">
        <v-nav-item-dummy
          v-show="isUserWalletConnected"
          id="dashboard"
          @mouseenter.native="handleShowDropdown"
          @mouseleave.native="handleHideDropdown"
          @focus.native="handleShowDropdown"
          @blur.native="handleHideDropdown"
        >
          {{ $t('navigation.dashboard') }}
        </v-nav-item-dummy>

        <VPopperBox
          ref="popper-dashboard"
          class="popper px-4 pt-4 rounded-lg flex flex-col flex-wrap text-xs absolute w-32"
          :class="[isMarketPage ? 'bg-gray-900' : 'bg-gray-800']"
          binding-element="#dashboard"
        >
          <div>
            <v-nav-item
              :to="{ name: 'funding' }"
              class="hover:text-primary-500 inline-block hover:bg-transparent"
              dense
            >
              {{ $t('navigation.balances') }}
            </v-nav-item>
            <v-nav-item
              :to="{ name: 'activities' }"
              class="hover:text-primary-500 inline-block hover:bg-transparent"
              dense
            >
              {{ $t('navigation.activities') }}
            </v-nav-item>
          </div>
        </VPopperBox>

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
import VNavItemDummy from './nav/item-dummy.vue'
import VNav from '~/components/layout/nav/index.vue'
import VLogo from '~/components/elements/logo.vue'
import VPopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    VNav,
    VNavItem,
    VNavItemDummy,
    VUserWallet,
    VLogo,
    VPopperBox,
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

      return ['spot-spot', 'derivatives-derivative'].includes(
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
