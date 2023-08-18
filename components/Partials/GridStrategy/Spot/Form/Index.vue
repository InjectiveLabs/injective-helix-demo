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

        <div
          v-if="
            !walletStore.isUserWalletConnected && !walletStore.injectiveAddress
          "
        >
          <CommonUserNotConnectedNote cta />
        </div>

        <template v-else>
          <!-- <PartialsGridStrategySpotFormErrors /> -->
          <PartialsGridStrategySpotFormCreate />
        </template>

        <ModalsCheckSpotGridAuth />
        <ModalsCreateGridSpotStrategy />
      </div>
    </div>
  </div>
</template>
