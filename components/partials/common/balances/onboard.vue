<template>
  <div>
    <v-button md primary class="w-full" @click="handleClickOnButton">
      <span v-if="activeStep === 1">{{ $t('common.deposit') }}</span>
      <span v-else-if="activeStep === 2">
        {{ $t('marketPage.transferToTrade') }}
      </span>
      <span v-else>{{ $t('common.trade') }}</span>
    </v-button>
    <div class="mt-6">
      <v-progress-steps
        :steps="3"
        :active-step="activeStep"
        :steps-labels="[
          $t('common.deposit'),
          $t('common.transfer'),
          $t('common.trade')
        ]"
        :steps-notes="[
          $t('marketPage.noChainBalanceNote'),
          $t('marketPage.noTradingAccountBalance'),
          $t('marketPage.startTrading')
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

    hasMadeAnyTransfers(): boolean {
      return this.$accessor.onboard.hasMadeAnyTransfers
    },

    hasMadeAnyTrades(): boolean {
      return this.$accessor.onboard.hasMadeAnyTrades
    },

    activeStep(): number {
      if (!this.hasAnyBankBalances) {
        return 1
      }

      if (!this.hasMadeAnyTransfers) {
        return 2
      }

      return 3
    }
  },

  methods: {
    handleClickOnButton() {
      this.$router.push({ name: 'funding' })
    }
  }
})
</script>
