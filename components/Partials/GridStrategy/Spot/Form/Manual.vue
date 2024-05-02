<script lang="ts" setup>
import { SharedUiSpotMarket } from '@shared/types'

const walletStore = useWalletStore()

defineProps({
  market: {
    type: Object as PropType<SharedUiSpotMarket>,
    required: true
  }
})
</script>

<template>
  <PartialsGridStrategySpotFormStrategyType />

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
