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

const gridStore = useGridStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()

const { validate } = useForm<SpotGridTradingForm>()

async function handleCreateStrategy() {
  const { valid } = await validate()
  if (!valid) {
    return
  }

  if (gridStore.isAuthorized) {
    modalStore.openModal({ type: Modal.CreateSpotGridStrategy })
  } else {
    modalStore.openModal({ type: Modal.CheckSpotGridAuth })
  }
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

        <button @click="gridStore.removeStrategy">cancel strategy</button>
        <button @click="gridStore.fetchStrategies">fetch strategy</button>

        <ModalsCheckSpotGridAuth />
        <ModalsCreateGridSpotStrategy />
      </div>
    </div>
  </div>
</template>
