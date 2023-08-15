<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const gridStore = useGridStore()
const modalStore = useModalStore()
const validate = useValidateForm()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const status = reactive(new Status(StatusType.Idle))

const hasActiveStrategy = computed(() => gridStore.runningStrategies.length > 0)

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

  if (gridStore.isAuthorized) {
    modalStore.openModal({ type: Modal.CreateSpotGridStrategy })
  } else {
    modalStore.openModal({ type: Modal.CheckSpotGridAuth })
  }
}

function onRemoveStrategy() {
  status.setLoading()

  gridStore
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
  </div>
</template>
