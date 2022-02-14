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
      <v-progress-steps :steps="3" :active-step="activeStep" />
      <div
        class="flex w-full justify-between tracking-wide uppercase mt-2.5 text-xs text-gray-500"
      >
        <span class="text-primary-500">01 {{ $t('common.deposit') }}</span>
        <span :class="{ 'text-primary-500': activeStep > 1 }">
          02 {{ $t('common.transfer') }}
        </span>
        <span :class="{ 'text-primary-500': activeStep > 2 }">
          03 {{ $t('common.trade') }}
        </span>
      </div>
      <div
        class="w-full mt-4 text-xs text-gray-400"
        :class="{
          'mx-auto': activeStep === 2,
          'ml-auto text-right': activeStep === 3
        }"
      >
        <p v-if="activeStep === 1">
          {{ $t('marketPage.noChainBalanceNote') }}
        </p>
        <p v-else-if="activeStep === 2">
          {{ $t('marketPage.noTradingAccountBalance') }}
        </p>
        <p v-else>
          {{ $t('marketPage.tradeDescription') }}
        </p>
      </div>
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
