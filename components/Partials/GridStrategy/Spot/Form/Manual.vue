<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const walletStore = useWalletStore()
</script>

<template>
  <PartialsGridStrategySpotFormLowerUpperPrice v-bind="{ market }" />

  <div>
    <PartialsGridStrategySpotFormGrids />
    <PartialsGridStrategySpotFormProfitPerGrid />
  </div>

  <PartialsGridStrategySpotFormInvestmentAmount v-bind="{ market }" />
  <PartialsGridStrategySpotFormAdvancedSettings />

  <CommonUserNotConnectedNote
    v-if="!walletStore.isUserWalletConnected && !walletStore.injectiveAddress"
    cta
  />

  <PartialsGridStrategySpotFormCreate v-else v-bind="{ market }" />
</template>
