<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()

function onCloseModal() {
  modalStore.closeModal(Modal.AlreadyJoinedGuild)
}
</script>

<template>
  <AppModal
    is-sm
    :is-open="modalStore.modals[Modal.AlreadyJoinedGuild]"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <h2 class="text-xl font-semibold normal-case text-center">
        {{ $t('guild.alreadyPartOfGuild.title') }}
      </h2>
    </template>

    <div class="text-center">
      <p class="font-semibold text-center">
        {{
          $t('guild.alreadyPartOfGuild.description', {
            address: walletStore.injectiveAddress
          })
        }}
      </p>

      <div class="mt-8 flex items-center gap-4">
        <AppButton
          class="w-full font-semibold bg-blue-500 text-blue-900"
          v-bind="{
            isLg: true
          }"
          @click="onCloseModal"
        >
          <span>
            {{ $t('common.close') }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
