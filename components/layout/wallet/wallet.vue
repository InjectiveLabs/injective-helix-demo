<template>
  <div class="flex items-center">
    <div class="flex items-center">
      <div
        id="wallet-address"
        class="font-mono text-sm cursor-pointer flex items-center p-2 rounded-lg"
        :class="{
          'text-primary-500 bg-gray-800': isWalletDropdownOpen,
          'text-gray-300': !isWalletDropdownOpen
        }"
        @mouseenter="handleShowDropdown"
        @mouseleave="handleHideDropdown"
        @focus="handleShowDropdown"
        @blur="handleHideDropdown"
      >
        <v-icon-user class="w-4 h-4 mr-2" />
        <span class="">
          {{ formattedInjectiveAddress }}
        </span>
      </div>
    </div>

    <VPopperBox
      ref="popper-wallet"
      class="popper bg-gray-800 rounded flex flex-col flex-wrap absolute min-w-xs z-10 shadow"
      binding-element="#wallet-address"
      :options="popperOption"
    >
      <div>
        <div class="flex items-center justify-between px-4 py-4">
          <h3 class="text-xs tracking-wide uppercase">
            {{ $t('navigation.myAccount') }}
          </h3>
          <span
            class="text-xs text-primary-500 cursor-pointer"
            @click="handleClickOnLogout"
            >{{ $t('navigation.disconnect') }}
          </span>
        </div>
        <div class="mt-2 flex items-center justify-between px-4">
          <div class="flex items-center">
            <v-logo-mini class="w-8 h-8 mr-4" />
            <span class="font-mono text-sm">{{
              formattedInjectiveAddress
            }}</span>
          </div>
          <div class="flex">
            <button
              v-clipboard="() => injectiveAddress"
              v-clipboard:success="
                () => $toast.success($t('connect.copiedAddress'))
              "
              role="button"
              type="button"
            >
              <v-icon-copy
                class="w-5 h-5 text-gray-500 hover:text-primary-500"
              />
            </button>
          </div>
        </div>
        <div v-if="false" class="mt-6 pt-4 px-4 border-t">
          <h3 class="text-xs tracking-wide uppercase">
            {{ $t('navigation.referrals') }}
          </h3>
        </div>
        <div class="mt-6 pt-4 px-4 border-t bg-gray-900">
          <h3 class="text-xs tracking-wide uppercase">
            {{ $t('navigation.connectedWallets') }}
          </h3>
          <ul class="pt-4 pb-6">
            <v-connected-wallet v-if="wallet === Wallet.Metamask">
              <v-icon-metamask class="ml-1 w-6 h-6" />
            </v-connected-wallet>
            <v-connected-wallet v-if="wallet === Wallet.Ledger">
              <v-icon-ledger class="ml-1 w-6 h-6" />
            </v-connected-wallet>
          </ul>
        </div>
      </div>
    </VPopperBox>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/web3-strategy'
import VConnectedWallet from './connected-wallet.vue'
import VLogoMini from '~/components/elements/logo-mini.vue'
import VPopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    VPopperBox,
    VLogoMini,
    VConnectedWallet
  },

  data() {
    return {
      Wallet,
      isInjectiveAddress: true,
      isWalletDropdownOpen: false,
      popperOption: {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      }
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    address(): string {
      return this.$accessor.wallet.address
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    formattedAddress(): string {
      const { address } = this

      return formatWalletAddress(address)
    },

    formattedInjectiveAddress(): string {
      const { injectiveAddress } = this

      return formatWalletAddress(injectiveAddress)
    },

    $popper(): any {
      return this.$refs['popper-wallet']
    }
  },

  methods: {
    handleClickOnLogout() {
      this.$accessor.wallet.logout()
    },

    handleShowDropdown() {
      this.$popper.showDropdown()
      this.isWalletDropdownOpen = true
    },

    handleHideDropdown() {
      this.$popper.hideDropdown()
      this.isWalletDropdownOpen = false
    }
  }
})
</script>
