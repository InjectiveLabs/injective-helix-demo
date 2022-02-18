<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <VHocLoading :status="status">
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
      </VHocLoading>
      <v-referee-onboarding-modal />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VBalances from '~/components/partials/funding/balances.vue'
import VWelcomeBanner from '~/components/partials/banners/welcome.vue'
import VGasRebate from '~/components/partials/banners/gas-rebate.vue'
import VBridge from '~/components/partials/funding/bridge.vue'
import { Modal } from '~/types'
import VRefereeOnboardingModal from '~/components/partials/modals/referee-onboarding.vue'

export default Vue.extend({
  components: {
    VBridge,
    VBalances,
    VWelcomeBanner,
    VGasRebate,
    VRefereeOnboardingModal
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.bank.fetchBankBalancesWithToken(),
      this.$accessor.account.fetchSubaccounts()
    ])
      .then(() => {
        this.checkForReferralCode()
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
  },

  methods: {
    checkForReferralCode() {
      const { $route } = this
      const { code } = $route.query

      if ($route.name === 'register' && code && code.toString().trim() !== '') {
        this.$accessor.modal.openModal(Modal.RefereeOnboarding)
      }
    }
  }
})
</script>
