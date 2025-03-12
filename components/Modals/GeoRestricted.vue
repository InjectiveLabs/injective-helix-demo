<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.GeoRestricted]" is-md>
    <div class="py-8 text-center">
      <h2 class="font-bold text-lg">{{ $t('geoRestricted.title') }}</h2>
      <p class="text-sm mt-4">
        {{ $t('geoRestricted.description') }}
      </p>
    </div>
  </AppModal>
</template>
