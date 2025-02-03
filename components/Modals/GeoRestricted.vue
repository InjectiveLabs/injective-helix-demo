<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.GeoRestricted]">
    <div class="py-8">
      <p class="font-bold text-md text-center">
        {{ $t('geoRestricted.description') }}
      </p>
    </div>
  </AppModal>
</template>
