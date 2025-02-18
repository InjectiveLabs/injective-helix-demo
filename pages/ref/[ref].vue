<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const route = useRoute()
const modalStore = useSharedModalStore()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  const referralCode = route.params.ref

  if (referralCode) {
    modalStore.openModal(Modal.ConfirmReferral)
  }
})
</script>

<template>
  <div>
    <AppHocLoading :status="status" is-full-screen />
    <ModalsConfirmReferral />
  </div>
</template>
