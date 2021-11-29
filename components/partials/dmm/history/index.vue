<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('dmm.history.title') }}
    </h3>
    <v-card class="mt-6">
      <div class="p-2">
        <div v-if="isUserWalletConnected">
          <p class="text-gray-500 uppercase text-xs">
            {{ $t('dmm.history.subaccountID') }}
          </p>
          <h3
            class="text-gray-200 text-base sm:text-lg md:text-2xl mt-3 break-all"
          >
            {{ injectiveAddress }}
          </h3>
        </div>

        <VHistoryTable class="mt-6" />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VHistoryTable from './history-table.vue'

export default Vue.extend({
  components: {
    VHistoryTable
  },

  data() {
    return {}
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    }
  },

  mounted() {},

  methods: {}
})
</script>
