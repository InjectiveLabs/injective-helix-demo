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
import { getHubUrl } from '~/app/utils/helpers'

export default Vue.extend({
  computed: {
    bridgeUrl() {
      return getHubUrl() + '/bridge'
    }
  }
})
</script>
