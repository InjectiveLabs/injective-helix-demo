<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const { xs } = useSharedBreakpoints()

function onCloseModal() {
  modalStore.closeModal(Modal.AlreadyJoinedGuild)
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.AlreadyJoinedGuild]"
    v-bind="{ isHideCloseButton: !xs }"
  >
    <template #title>
      <h2 class="text-xl font-semibold normal-case text-center">
        {{ $t('guild.alreadyPartOfGuild.title') }}
      </h2>
    </template>

    <div class="text-center">
      <p class="font-semibold text-center break-all">
        {{
          $t('guild.alreadyPartOfGuild.description', {
            address: sharedWalletStore.injectiveAddress
          })
        }}
      </p>

      <div class="mt-8 flex justify-center gap-4">
        <AppButton
          class="w-full font-semibold bg-blue-500 text-blue-900"
          size="lg"
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
