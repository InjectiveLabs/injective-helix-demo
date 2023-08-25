<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'
import {
  gridStrategyAuthorizationMessageTypes,
  spotGridMarkets
} from '@/app/data/grid-strategy'

const authZStore = useAuthZStore()
const gridStrategyStore = useGridStrategyStore()
const modalStore = useModalStore()
const validate = useValidateForm()

const status = reactive(new Status(StatusType.Idle))

const hasActiveStrategy = computed(
  () => gridStrategyStore.activeStrategies.length > 0
)

async function onCreateStrategy() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  const gridMarket = spotGridMarkets.find(
    (m) => m.slug === gridStrategyStore.spotMarket?.slug
  )

  const isAuthorized = gridStrategyAuthorizationMessageTypes.every((m) =>
    authZStore.granterGrants.some(
      (g) =>
        g.authorization.endsWith(m) && g.grantee === gridMarket?.contractAddress
    )
  )

  if (isAuthorized) {
    modalStore.openModal(Modal.CreateSpotGridStrategy)
  } else {
    modalStore.openModal(Modal.CheckSpotGridAuth)
  }
}
</script>

<template>
  <div class="pt-4">
    <AppButton
      :status="status"
      lg
      class="w-full font-sembold shadow-none hover:text-green-900 bg-green-500 text-green-800"
      :disabled="hasActiveStrategy"
      @click="onCreateStrategy"
    >
      <span v-if="hasActiveStrategy">{{ $t('sgt.inProgress') }}</span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <p v-if="hasActiveStrategy" class="text-red-500 text-xs font-semibold mt-4">
      Your strategy is on the move! Find all the details under the chart at the
      bottom right corner. If you're on a smaller screen, a quick scroll down
      might be needed to see everything.
    </p>
  </div>
</template>
