<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { SpotGridTradingForm } from '@/types'

const walletStore = useWalletStore()

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

useForm<SpotGridTradingForm>()
</script>

<template>
  <div class="min-w-0">
    <div>
      <div class="space-y-4">
        <PartialsGridStrategySpotFormLowerUpperPrice />
        <PartialsGridStrategySpotFormGrids />
        <PartialsGridStrategySpotFormProfitPerGrid />
        <PartialsGridStrategySpotFormInvestmentAmount v-bind="{ market }" />

        <CommonUserNotConnectedNote
          v-if="
            !walletStore.isUserWalletConnected && !walletStore.injectiveAddress
          "
          cta
        />

        <PartialsGridStrategySpotFormCreate v-else />

        <ModalsCheckSpotGridAuth />
        <ModalsCreateGridSpotStrategy />
      </div>
    </div>
  </div>
</template>
