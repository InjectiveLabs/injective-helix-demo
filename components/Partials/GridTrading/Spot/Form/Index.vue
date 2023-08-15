<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { SpotGridTradingForm } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})
const walletStore = useWalletStore()

useForm<SpotGridTradingForm>()
</script>

<template>
  <div class="min-w-0">
    <div>
      <div class="space-y-4">
        <PartialsGridTradingSpotFormLowerUpperPrice />

        <PartialsGridTradingSpotFormGrids />

        <PartialsGridTradingSpotFormProfitPerGrid />

        <PartialsGridTradingSpotFormInvestmentAmount v-bind="{ market }" />

        <div
          v-if="
            !walletStore.isUserWalletConnected && !walletStore.injectiveAddress
          "
        >
          <CommonUserNotConnectedNote cta />
        </div>

        <template v-else>
          <PartialsGridTradingSpotFormErrors />

          <PartialsGridTradingSpotFormCreate />
        </template>

        <ModalsCheckSpotGridAuth />
        <ModalsCreateGridSpotStrategy />
      </div>
    </div>
  </div>
</template>
