<template>
  <div>
    <VButton md primary class="w-full" @click="handleClickOnButton">
      <span v-if="activeStep === 1" data-cy="onboarding-banner-deposit-button">
        {{ $t('common.deposit') }}
      </span>
      <span
        v-else-if="activeStep === 2"
        data-cy="onboarding-banner-transfer-button"
      >
        {{ $t('marketPage.transferToTrade') }}
      </span>
      <span v-else data-cy="onboarding-banner-trade-button">{{
        $t('common.trade')
      }}</span>
    </VButton>
    <div class="mt-6">
      <ProgressSteps
        data-cy="onboarding-banner-progress-steps"
        :steps="2"
        :active-step="activeStep"
        :steps-labels="[$t('common.deposit'), $t('common.transfer')]"
        :steps-notes="[
          $t('marketPage.noChainBalanceNote'),
          $t('marketPage.noTradingAccountBalance')
        ]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    hasAnyBankBalances(): boolean {
      return this.$accessor.bank.hasAnyBankBalance
    },

    activeStep(): number {
      if (!this.hasAnyBankBalances) {
        return 1
      }

      return 2
    }
  },

  methods: {
    handleClickOnButton() {
      this.$router.push({ name: 'portfolio' })
    }
  }
})
</script>
