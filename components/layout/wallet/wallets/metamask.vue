<template>
  <li>
    <div
      class="block hover:bg-gray-800 border-gray-600 rounded-lg cursor-pointer"
      @click="handleClickOnMetamaskConnect"
    >
      <div class="flex items-center px-4 py-4 sm:px-6">
        <div class="min-w-0 flex-1 flex items-center">
          <div class="flex-shrink-0 mr-4">
            <IconMetamask class="w-8 h-8" />
          </div>
          <div
            class="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4 text-left"
          >
            <div>
              <p class="text-xl font-semibold text-gray-200 truncate">
                {{ $t('connect.metamask') }}
                <VButton
                  v-if="!metamaskInstalled"
                  text
                  sm
                  class="inline-flex items-center"
                  @click.stop="() => {}"
                >
                  <a
                    href="https://metamask.io/download"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {{ $t('connect.download') }}
                  </a>
                  <IconArrow class="transform rotate-180 w-3 h-3 ml-1" />
                </VButton>
              </p>
              <p class="flex items-center text-sm text-gray-200">
                <span
                  class="truncate"
                  data-cy="connect-wallet-popup-metamask-button"
                >
                  {{ $t('connect.connectUsingBrowser') }}
                </span>
              </p>
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
import { WalletConnectStatus } from '~/types'

export default Vue.extend({
  computed: {
    metamaskInstalled(): boolean {
      return this.$accessor.wallet.metamaskInstalled
    }
  },

  methods: {
    handleClickOnMetamaskConnect() {
      this.$accessor.wallet
        .connectMetamask()
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
