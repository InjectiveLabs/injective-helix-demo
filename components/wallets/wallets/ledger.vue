<template>
  <li>
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
            <v-icon-ledger class="w-8 h-8" />
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
              <p class="text-lg text-gray-100 truncate">Ledger</p>
              <p class="flex items-center text-sm text-gray-400">
                <span class="truncate">Connect using hardware wallet</span>
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
    <v-modal-ledger
      :is-open="isLedgerModalOpen"
      @closed="isLedgerModalOpen = false"
    />
  </li>
</template>

<script lang="ts">
import Vue from 'vue'
import VModalLedger from '~/components/wallets/ledger/index.vue'
import { Icon } from '~/types'

export default Vue.extend({
  components: {
    VModalLedger
  },

  data() {
    return {
      Icon,
      isLedgerModalOpen: false
    }
  },

  methods: {
    handleConnectClick() {
      this.isLedgerModalOpen = true
    }
  }
})
</script>
