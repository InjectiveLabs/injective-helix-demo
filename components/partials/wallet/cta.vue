<template>
  <div>
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-200">
        {{ $t('Ready to get started?') }}
      </h3>
    </div>

    <v-card class="mt-6 relative text-center">
      <div class="p-4">
        <h4 class="text-md lg:text-lg text-gray-300 w-full mx-auto lg:w-2/3">
          {{ $t('Cta Note') }}
        </h4>
        <div class="mt-4">
          <v-button primary lg>
            <a :href="bridgeUrl" target="_blank">
              {{ $t('Join our Ecosystem now') }}
            </a>
          </v-button>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Network } from '@injectivelabs/networks'
import Vue from 'vue'
import { NETWORK } from '~/app/utils/constants'

export default Vue.extend({
  computed: {
    bridgeUrl() {
      if (NETWORK === Network.Devnet) {
        return 'https://devnet.hub.injective.dev/bridge'
      }

      if (NETWORK === Network.Testnet) {
        return 'https://testnet.hub.injective.dev/bridge'
      }

      return 'https://hub.injective.network/bridge'
    }
  }
})
</script>
