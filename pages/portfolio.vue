<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <VHocLoading :status="status">
        <div class="container pt-6 pb-12">
          <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
            <v-welcome-banner />
            <!--
              A clever solution here to apply loading state to account
              summary based on the bank/trading account balances loading
            -->
            <div class="pb-6 relative">
              <portal-target name="account-summary" />
            </div>
            <v-gas-rebate class="mt-6" />
            <div class="border-b border-gray-600 w-full my-6"></div>
            <v-balances class="mt-4" />
            <v-bridge />
          </div>
        </div>
      </VHocLoading>
      <v-referee-onboarding-modal v-if="REFERRALS_ENABLED" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { RefereeInfo } from '@injectivelabs/referral-consumer'
import VBalances from '~/components/partials/portfolio/balances.vue'
import VWelcomeBanner from '~/components/partials/banners/welcome.vue'
import VGasRebate from '~/components/partials/banners/gas-rebate.vue'
import VBridge from '~/components/partials/portfolio/bridge.vue'
import { Modal } from '~/types'
import VRefereeOnboardingModal from '~/components/partials/modals/referee-onboarding.vue'
import { REFERRALS_ENABLED } from '~/app/utils/constants'

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
      REFERRALS_ENABLED,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    refereeInfo(): RefereeInfo | undefined {
      return this.$accessor.referral.refereeInfo
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
  },

  methods: {
    checkForReferralCode() {
      const { $route, refereeInfo } = this
      const { code } = $route.query

      if ($route.name === 'register' && code && code.toString().trim() !== '') {
        if (refereeInfo === undefined) {
          this.$accessor.modal.openModal(Modal.RefereeOnboarding)
        } else {
          this.$toast.error(this.$t('referralModal.alreadyReferredToast'))
        }
      }
    }
  }
})
</script>
