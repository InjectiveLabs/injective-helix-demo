<template>
  <div class="h-full w-full flex flex-wrap">
    <HOCLoading :status="status">
      <div class="w-full">
        <v-rebate v-if="GAS_FREE_DEPOSIT_REBATE_ENABLED" />
        <div class="container py-4">
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
      </div>
    </HOCLoading>
    <v-referee-onboarding-modal v-if="REFERRALS_ENABLED" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VBalances from '~/components/partials/wallet/balances/index.vue'
import VTransferOnChain from '~/components/partials/wallet/transfer-on-chain.vue'
import VCta from '~/components/partials/wallet/cta.vue'
import VRebate from '~/components/partials/wallet/rebate.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import VRefereeOnboardingModal from '~/components/partials/modals/referee-onboarding.vue'
import { Modal } from '~/types'
import {
  GAS_FREE_DEPOSIT_REBATE_ENABLED,
  REFERRALS_ENABLED
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VBalances,
    VRebate,
    VCta,
    VRefereeOnboardingModal,
    VTransferOnChain,
    HOCLoading
  },

  data() {
    return {
      GAS_FREE_DEPOSIT_REBATE_ENABLED,
      REFERRALS_ENABLED,
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    this.$accessor.wallet
      .initPage()
      .then(() => {
        this.checkForReferralCode()
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.wallet.resetPage()
  },

  methods: {
    checkForReferralCode() {
      const { $route } = this
      const { code } = $route.query

      if (!REFERRALS_ENABLED) {
        return
      }

      if ($route.name === 'register' && code && code.toString().trim() !== '') {
        this.$accessor.modal.openModal(Modal.RefereeOnboarding)
      }
    }
  }
})
</script>
