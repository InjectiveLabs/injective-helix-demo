<template>
  <div class="flex justify-between items-center relative px-4 xl:w-64">
    <div
      id="wallet-dropdown"
      class="
        items-center
        justify-start
        sm:justify-center
        select-none
        cursor-pointer
        flex
        w-full
      "
      @click.stop="toggleDropdown"
    >
      <v-ui-icon
        :class="isUserWalletConnected ? 'text-primary-500' : 'text-white'"
        :icon="Icon.Wallet"
        lg
        class="mr-4 hidden md:block"
      />
      <div class="whitespace-nowrap">
        <div v-if="!isUserWalletConnected" class="w-full">
          <p class="text-gray-500 text-2xs leading-none">
            {{ $t('not_connected') }}
          </p>
          <p class="font-semibold text-white">
            {{ $t('connect_to_wallet') }}
          </p>
        </div>
        <div v-else>
          <p class="text-gray-500 text-2xs leading-none">
            {{ $t('connected') }}
          </p>
          <p class="font-bold text-sm text-white font-mono">
            <span>
              {{ formattedAddress }}
            </span>
            <span
              v-clipboard="() => injectiveAddress"
              v-clipboard:success="() => $toast.success($t('address_copied'))"
            >
              <v-ui-icon
                :icon="Icon.Copy"
                :tooltip="$t('copy_address')"
                class="text-gray-500 hover:text-primary-500"
                stroke-only
                xs
              />
            </span>
          </p>
        </div>
      </div>
      <v-ui-icon
        :icon="Icon.Dropdown"
        xs
        class="text-gray-500 group-hover:text-gray-300 ml-4"
      />
    </div>

    <div
      v-on-clickaway="closeDropdown"
      :class="isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'"
      class="
        absolute
        flex
        justify-center
        border
        flex-wrap
        top-0
        left-auto
        mr-0
        -mx-px
        right-0
        min-w-xs
        mt-12
        rounded rounded-tl-none
        bg-dark-700
        shadow-md
      "
    >
      <ul v-if="!isUserWalletConnected" class="py-2 px-1">
        <v-disclaimer v-if="TRANSFER_RESTRICTIONS_ENABLED" />
        <v-metamask />
        <v-ledger class="mt-2" />
      </ul>
      <div v-else class="flex flex-wrap w-full">
        <div
          class="
            w-full
            bg-dark-700
            font-semibold
            py-2
            px-4
            text-sm
            cursor-pointer
            hover:bg-hover300
          "
          @click.stop="onTransferNavClick"
        >
          <span>{{ $t('transfer') }}</span>
        </div>
        <div
          class="
            w-full
            bg-dark-700
            font-semibold
            py-2
            px-4
            text-sm
            cursor-pointer
            hover:bg-hover300
          "
          @click.stop="onLogoutClick"
        >
          <span>{{ $t('logout') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AccountAddress } from '@injectivelabs/ts-types'
import { Wallet } from '@injectivelabs/web3-strategy'
import { directive as onClickaway } from 'vue-clickaway'
import { formatWalletAddress } from '@injectivelabs/utils'
import VDisclaimer from './disclaimer.vue'
import VMetamask from './wallets/metamask.vue'
import VLedger from './wallets/ledger.vue'
import { TRANSFER_RESTRICTIONS_ENABLED } from '~/app/utils/constants'
import { Icon, Modal } from '~/types'

export default Vue.extend({
  components: {
    VMetamask,
    VLedger,
    VDisclaimer
  },

  directives: {
    onClickaway
  },

  data() {
    return {
      TRANSFER_RESTRICTIONS_ENABLED,
      isDropdownOpen: false,
      Wallet,
      Icon
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    address(): AccountAddress {
      return this.$accessor.wallet.address
    },

    injectiveAddress(): AccountAddress {
      return this.$accessor.wallet.injectiveAddress
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    formattedAddress(): string {
      const { injectiveAddress } = this

      return formatWalletAddress(injectiveAddress)
    }
  },

  methods: {
    closeDropdown() {
      if (this.isDropdownOpen) {
        this.isDropdownOpen = false
      }
    },

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen
    },

    onLogoutClick() {
      this.$accessor.wallet.logout()
    },

    onTransferNavClick() {
      this.$accessor.modal.openModal(Modal.TransferOnChain)
    }
  }
})
</script>
