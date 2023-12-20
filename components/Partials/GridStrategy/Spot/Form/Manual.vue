<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

const walletStore = useWalletStore()

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <PartialsGridStrategySpotFormLowerUpperPrice v-bind="{ market }" />

  <div>
    <PartialsGridStrategySpotFormGrids />
    <PartialsGridStrategySpotFormProfitPerGrid />
  </div>

  <PartialsGridStrategySpotFormInvestmentAmount v-bind="{ market }" />
  <PartialsGridStrategySpotFormAdvancedSettings />

  <CommonUserNotConnectedNote v-if="!walletStore.isUserWalletConnected" cta />

  <PartialsGridStrategySpotFormCreate v-else v-bind="{ market }" />
</template>
