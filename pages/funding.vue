<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <HOCLoading :status="status">
        <div class="container py-4">
          <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
            <v-welcome-banner />
            <v-account-summary class="mt-6" />
            <v-new-user-banner class="mt-6" />
            <div class="border-b border-gray-600 w-full my-6"></div>
            <v-funding-balances class="mt-4" />
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
import VFundingBalances from '~/components/partials/funding/funding-balances.vue'
import VAccountSummary from '~/components/partials/funding/account-summary.vue'
import VWelcomeBanner from '~/components/partials/banners/welcome.vue'
import VNewUserBanner from '~/components/partials/banners/new-user.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    VFundingBalances,
    VAccountSummary,
    VWelcomeBanner,
    VNewUserBanner
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([this.$accessor.bank.fetchBankBalancesWithToken()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  }
})
</script>
