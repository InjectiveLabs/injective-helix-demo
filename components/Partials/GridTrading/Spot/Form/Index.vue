<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { Modal, SpotGridTradingForm } from '@/types'
// import { SpotGridTradingForm } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})
const modalStore = useModalStore()
const walletStore = useWalletStore()

const { validate } = useForm<SpotGridTradingForm>()

async function handleCreateStrategy() {
  const { valid } = await validate()
  if (!valid) {
    return
  }

  modalStore.openModal({ type: Modal.CreateSpotGridStrategy })
}
</script>

<template>
  <div class="min-w-0">
    <div
      v-if="!walletStore.isUserWalletConnected && !walletStore.injectiveAddress"
    >
      Connect
    </div>

    <div v-else>
      <div class="space-y-2">
        <PartialsGridTradingSpotFormLowerUpperPrice />

        <PartialsGridTradingSpotFormGrids />

        <PartialsGridTradingSpotFormProfitPerGrid />

        <PartialsGridTradingSpotFormInvestmentAmount v-bind="{ market }" />

        <PartialsGridTradingSpotFormCreate
          @handle-create="handleCreateStrategy"
        />
      </div>
    </div>
  </div>
</template>
