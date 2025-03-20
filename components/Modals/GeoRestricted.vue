<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.GeoRestricted]">
    <img src="/svg/GeoRestriction.svg" class="mx-auto mt-2" />

    <div class="text-center mt-8">
      <h2 class="font-bold text-lg">{{ $t('geoRestricted.title') }}</h2>
      <p class="text-sm mt-4 text-coolGray-450">
        {{ $t('geoRestricted.description') }}
      </p>

      <AppButton class="w-full mt-4">{{ $t('geoRestricted.cta') }}</AppButton>
    </div>
  </AppModal>
</template>
