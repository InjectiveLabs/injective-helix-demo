<script setup lang="ts">
import { Modal } from '@/types'

withDefaults(defineProps<{ round: number }>(), {})

const modalStore = useSharedModalStore()

function closeModal() {
  modalStore.closeModal(Modal.LpRewards)
}
</script>

<template>
  <Teleport to="body">
    <AppModal
      v-model="modalStore.modals[Modal.LpRewards]"
      v-bind="{ isHideCloseButton: true }"
    >
      <template #title>
        <p class="text-center">
          {{ $t('lpRewards.helixLpRewardsRound', { round: round }) }}
        </p>
      </template>

      <div class="md:text-lg space-y-2 text-center text-coolGray-300">
        <div>
          <i18n-t keypath="lpRewards.roundIsLive" tag="div">
            <template #round1>
              <span>{{ $t('lpRewards.round', { round }) }}</span>
            </template>
            <template #round2>
              <span>{{ $t('lpRewards.round', { round: round - 1 }) }}</span>
            </template>
            <template #myRewards>
              <span>{{ $t('lpRewards.myRewards') }}</span>
            </template>
          </i18n-t>
        </div>

        <div class="pt-2 grid grid-cols-1 gap-2">
          <AppButton class="font-semibold w-full" @click="closeModal">
            {{ $t('lpRewards.letsGo') }}
          </AppButton>

          <AppButton
            variant="primary-outline"
            class="w-full"
            @click="closeModal"
          >
            {{ $t('common.close') }}
          </AppButton>
        </div>
      </div>
    </AppModal>
  </Teleport>
</template>
