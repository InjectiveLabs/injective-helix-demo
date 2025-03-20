<script lang="ts" setup>
import { IS_MAINNET } from '@shared/utils/constant'
import { Modal, TradeSubPage } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const isModalOpen = computed(
  () =>
    IS_MAINNET &&
    modalStore.modals[Modal.IAsset] &&
    !appStore.userState.modalsViewed.includes(Modal.IAsset)
)

function onModalClose() {
  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, Modal.IAsset]
  })
}
</script>

<template>
  <AppModal v-bind="{ modelValue: isModalOpen }" @on:close="onModalClose">
    <div>
      <img src="/svg/nvidia.svg" class="mx-auto mt-2" />

      <div class="text-center">
        <h2 class="text-lg font-bold mt-8">
          {{ $t('trade.iAssetModal.title') }}
        </h2>

        <p class="text-sm mt-4 text-coolGray-450">
          {{ $t('trade.iAssetModal.description') }}
        </p>

        <NuxtLink
          class="w-full mt-4"
          :to="{
            name: TradeSubPage.Futures,
            params: {
              slug: 'invda-usdt-perp'
            }
          }"
          @click="onModalClose"
        >
          <AppButton class="mt-4 w-full">
            <span class="text-sm">{{ $t('trade.iAssetModal.cta') }}</span>
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>
