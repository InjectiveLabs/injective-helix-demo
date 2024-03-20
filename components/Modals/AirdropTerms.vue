<script lang="ts" setup>
import { Modal } from '@/types'
import { termsOfUse } from '@/app/data/airdrop'

const modalStore = useModalStore()
const router = useRouter()

const isModalOpen = computed(() => modalStore.modals[Modal.AirdropTerms])

const emit = defineEmits<{
  'terms:accept': []
}>()

function onConfirm() {
  emit('terms:accept')
  closeModal()
}

function closeModal() {
  modalStore.closeModal(Modal.AirdropTerms)
}

function onModalClose() {
  closeModal()
  router.push('/')
}

function onCancel() {
  closeModal()
  router.push('/')
}
</script>

<template>
  <AppModal :is-open="isModalOpen" @modal:closed="onModalClose">
    <template #title>
      <h3>
        {{ $t('airdrop.tosHeader') }}
      </h3>
    </template>

    <div class="relative">
      <ul class="p-4 bg-gray-900 mt-6 text-xs text-gray-300 rounded-lg">
        <li class="font-bold text-gray-200">
          <pre
            class="whitespace-break-spaces font-sans max-h-56 overflow-y-auto font-normal"
          >
            {{ termsOfUse }}
          </pre>
        </li>
      </ul>
      <div class="mt-6 flex items-center justify-center gap-3">
        <AppButton
          class="bg-blue-500 text-blue-900 font-semibold"
          @click="onConfirm"
        >
          {{ $t('common.confirm') }}
        </AppButton>
        <AppButton
          class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
          @click="onCancel"
        >
          {{ $t('common.cancel') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
