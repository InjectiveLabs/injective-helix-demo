<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <HOCLoading :status="status">
        <div class="container py-4">
          <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
            <v-welcome-banner />
            <!--
              A clever solution here to apply loading state to account
              summary based on the bank/trading account balances loading
            -->
            <div class="mt-6 py-6 relative">
              <portal-target name="account-summary"></portal-target>
            </div>
            <v-gas-rebate class="mt-6" />
            <div class="border-b border-gray-600 w-full my-6"></div>
            <v-balances class="mt-4" />
            <v-bridge />
          </div>
        </div>
      </HOCLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import HOCLoading from '~/components/hoc/loading.vue'
import VBalances from '~/components/partials/funding/balances.vue'
import VWelcomeBanner from '~/components/partials/banners/welcome.vue'
import VGasRebate from '~/components/partials/banners/gas-rebate.vue'
import VBridge from '~/components/partials/funding/bridge.vue'

export default Vue.extend({
  components: {
    VBridge,
    HOCLoading,
    VBalances,
    VWelcomeBanner,
    VGasRebate
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.bank.fetchBankBalancesWithToken(),
      this.$accessor.account.fetchSubaccounts(),
      this.$accessor.account.fetchSubaccountsBalances(),
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.positions.fetchOrderbook(),
      this.$accessor.positions.fetchSubaccountPositions()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([
      this.$accessor.onboard.init(),
      this.$accessor.gasRebate.init()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        //
      })
  }
})
</script>
