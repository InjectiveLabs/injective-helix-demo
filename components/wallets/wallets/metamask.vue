<template>
  <li class="mt-2">
    <div
      class="
        block
        bg-dark-600
        hover:bg-dark-800
        border
        rounded-lg
        cursor-pointer
      "
      @click="handleConnectClick"
    >
      <div class="flex items-center p-2">
        <div class="min-w-0 flex-1 flex items-center">
          <div class="flex-shrink-0 mr-2">
            <v-icon-metamask class="w-8 h-8" />
          </div>
          <div
            class="
              min-w-0
              flex-1
              px-4
              md:grid md:grid-cols-1
              md:gap-4
              text-left
            "
          >
            <div>
              <p class="text-lg text-gray-100 truncate">Metamask</p>
              <p class="flex items-center text-sm text-gray-400">
                <span class="truncate">Connect using browser wallet</span>
              </p>
            </div>
          </div>
        </div>
        <div>
          <v-ui-icon
            :icon="Icon.Dropdown"
            class="transform -rotate-90 h-5 w-5 text-gray-400"
          />
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue'
import { Wallet } from '@injectivelabs/web3-strategy'
import { Icon } from '~/types'

export default Vue.extend({
  data() {
    return {
      Icon
    }
  },

  methods: {
    handleConnectClick() {
      this.$accessor.wallet
        .connectAndConfirm(Wallet.Metamask)
        .then(() => {
          this.$toast.success(this.$t('success_connect'))
        })
        .catch(this.$onRejected)
    }
  }
})
</script>
