<script lang="ts" setup>
import { UiSpotMarket } from '@/types'

const walletStore = useWalletStore()

defineProps({
  market: {
    type: Object as PropType<UiSpotMarket>,
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
