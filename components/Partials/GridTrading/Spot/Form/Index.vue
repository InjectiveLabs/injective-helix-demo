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

const { errors: formErrors, validate } = useForm<SpotGridTradingForm>()

async function handleCreateStrategy() {
  const { valid } = await validate()
  if (!valid) {
    return
  }

  modalStore.openModal({ type: Modal.CreateSpotGridStrategy })
}
</script>

<template>
  <div>
    <div
      v-if="!walletStore.isUserWalletConnected && !walletStore.injectiveAddress"
    >
      Connect
    </div>

    <div v-else>
      <div class="space-y-2">
        <div class="overflow-x-auto w-[300px]">
          <pre>
          {{ formErrors }}
          </pre>
        </div>
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
