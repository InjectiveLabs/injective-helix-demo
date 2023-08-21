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
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const status = reactive(new Status(StatusType.Idle))

const hasActiveStrategy = computed(
  () => gridStrategyStore.activeStrategies.length > 0
)

function onClick() {
  if (hasActiveStrategy.value) {
    onRemoveStrategy()
  } else {
    onCreateStrategy()
  }
}

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

function onRemoveStrategy() {
  status.setLoading()

  gridStrategyStore
    .removeStrategy()
    .then(() => {
      success({
        title: t('sgt.success'),
        description: t('sgt.strategyRemoved')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="pt-4">
    <AppButton
      :status="status"
      lg
      :class="{
        'hover:text-green-900 bg-green-500 text-green-800': !hasActiveStrategy,
        'hover:bg-red-600 bg-red-500 text-white': hasActiveStrategy
      }"
      class="w-full font-sembold shadow-none"
      @click="onClick"
    >
      <span v-if="hasActiveStrategy">{{ $t('sgt.removeStrategy') }}</span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <p v-if="hasActiveStrategy" class="text-red-500 text-xs font-semibold mt-4">
      Note: you first need to remove the active strategy before creating a new
      one, since currently only 1 active strategy is allowed
    </p>
  </div>
</template>
