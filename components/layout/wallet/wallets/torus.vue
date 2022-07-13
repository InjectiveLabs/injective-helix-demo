<template>
  <li>
    <div class="block hover:bg-gray-800 border-gray-600 rounded-lg cursor-pointer" @click="handleClickOnTorusConnect">
      <div class="flex items-center px-4 py-4 sm:px-6">
        <div class="min-w-0 flex-1 flex items-center">
          <div class="flex-shrink-0 mr-4 text-gray-200">
            <IconTorus class="w-8 h-8" />
          </div>
          <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4 text-left">
            <div>
              <p class="text-xl font-semibold text-gray-200 truncate">
                {{ $t('connect.torus') }}
              </p>
              <div class="flex items-center text-sm text-gray-200">
                <span class="truncate" data-cy="connect-wallet-popup-torus-button">
                  {{ $t('connect.connectUsingTorus') }}
                </span>
                <div class="ml-4 grid grid-cols-4 gap-4">
                  <IconGoogleSocial class="w-4 h-4" />
                  <IconFacebookSocial class="w-4 h-4" />
                  <IconTwitterSocial class="w-4 h-4" />
                  <IconDiscordSocial class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <IconCaretDown class="transform -rotate-90 h-5 w-5 text-gray-200" />
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue'
import { WalletConnectStatus } from '~/types/enums'

export default Vue.extend({
  computed: {
    metamaskInstalled(): boolean {
      return this.$accessor.wallet.metamaskInstalled
    }
  },

  methods: {
    handleClickOnTorusConnect() {
      this.$accessor.wallet
        .connectTorus()
        .then(() => {
          this.$emit('wallet-connected')
        })
        .catch((e) => {
          this.$accessor.wallet.setWalletConnectStatus(
            WalletConnectStatus.disconnected
          )
          this.$onError(e)
        })
    }
  }
})
</script>
