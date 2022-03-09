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
