<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <HocLoading :status="status">
        <div class="container pt-6 pb-12">
          <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
            <!--
              A clever solution here to apply loading state to account
              summary based on the bank/trading account balances loading
            -->
            <div class="relative">
              <portal-target name="account-summary" />
            </div>
            <Balances class="mt-8" />
            <Bridge />
          </div>
        </div>
      </HocLoading>
      <modal-onboard-referee v-if="REFERRALS_ENABLED" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { RefereeInfo } from '@injectivelabs/referral-consumer'
import Balances from '~/components/partials/portfolio/balances.vue'
import Bridge from '~/components/partials/portfolio/bridge.vue'
import { Modal } from '~/types'
import ModalOnboardReferee from '~/components/partials/modals/referee-onboarding.vue'
import { REFERRALS_ENABLED } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    Bridge,
    Balances,
    ModalOnboardReferee
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
