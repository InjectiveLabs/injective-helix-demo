<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
          <div class="flex flex-wrap -mx-4">
            <div class="w-full xl:w-2/3 px-4">
              <v-panel :title="$t('balances')" class="mt-6">
                <v-balances />
              </v-panel>
            </div>
            <div class="w-full xl:w-1/3 px-4">
              <v-panel :title="$t('transfer_on_chain')" class="mt-6">
                <v-transfer-on-chain />
              </v-panel>
            </div>
          </div>
          <v-cta class="mt-12" />
        </div>
      </div>
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VBalances from '~/components/partials/wallet/balances/index.vue'
import VTransferOnChain from '~/components/partials/wallet/transfer-on-chain.vue'
import VCta from '~/components/partials/wallet/cta.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    VBalances,
    VCta,
    VTransferOnChain,
    HOCLoading
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    this.$accessor.wallet
      .initPage()
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.wallet.resetPage()
  }
})
</script>
