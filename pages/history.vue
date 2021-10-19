<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
          <v-overview v-if="!isUserWalletConnected" class="mt-6" />
          <v-panel v-if="false" :title="$t('wallet_history')">
            <v-wallet-history />
          </v-panel>
          <v-panel
            :title="$t('trade_history')"
            :class="{
              'mt-12': !isUserWalletConnected,
              'mt-6': isUserWalletConnected
            }"
          >
            <v-trade-history />
          </v-panel>
          <v-panel :title="$t('subaccount_transfer_history')" class="mt-12">
            <v-subaccount-transfer-history />
          </v-panel>
        </div>
      </div>
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VOverview from '~/components/partials/history/overview.vue'
import VWalletHistory from '~/components/partials/history/wallet.vue'
import VSubaccountTransferHistory from '~/components/partials/history/transfers.vue'
import VTradeHistory from '~/components/partials/history/trades.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    VOverview,
    VSubaccountTransferHistory,
    VWalletHistory,
    VTradeHistory,
    HOCLoading
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  mounted() {
    this.$accessor.history
      .init()
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.history.reset()
  }
})
</script>
