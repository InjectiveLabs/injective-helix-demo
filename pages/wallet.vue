<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto lg:w-3/4">
          <v-panel :title="$t('balances')" class="mt-6">
            <v-balances />
          </v-panel>
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
import VCta from '~/components/partials/wallet/cta.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    VBalances,
    VCta,
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
