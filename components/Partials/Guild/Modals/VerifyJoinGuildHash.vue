<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()
const { validate, resetForm } = useForm()

const props = defineProps({
  invitationHash: {
    type: String,
    required: true
  }
})

const HASH_FIELD = 'hash'

const { value: hash, errors: hashErrors } = useStringField({
  name: HASH_FIELD
})

function onCloseModal() {
  modalStore.closeModal(Modal.VerifyJoinGuildHash)
}

async function onSubmit() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (props.invitationHash !== hash.value) {
    return
  }

  modalStore.openModal(Modal.JoinGuild)
  modalStore.closeModal(Modal.VerifyJoinGuildHash)
}

watch(
  () => modalStore.modals[Modal.VerifyJoinGuildHash],
  (isOpen: boolean) => {
    if (isOpen) {
      resetForm()
    }
  }
)
</script>

<template>
  <AppModal
    sm
    :is-open="modalStore.modals[Modal.VerifyJoinGuildHash]"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <h2 class="text-xl font-semibold normal-case text-center">
        {{ $t('guild.verifyJoinGuild.title') }}
      </h2>
    </template>

    <p class="font-semibold my-6">
      {{ $t('guild.verifyJoinGuild.description') }}
    </p>

    <div class="flex items-center justify-between text-xs mb-2">
      <span class="font-bold">
        {{ $t('guild.verifyJoinGuild.hash') }}
      </span>
    </div>

    <AppInput
      v-model="hash"
      sm
      wrapper-classes="p-2"
      :placeholder="$t('guild.verifyJoinGuild.hashPlaceholder')"
    />
    <p
      v-if="hashErrors[0]"
      class="text-red-500 first-letter:uppercase text-sm mt-1"
    >
      {{ hashErrors[0] }}
    </p>

    <div class="w-full mt-8">
      <AppButton
        class="w-full bg-blue-500 text-white font-semibold"
        v-bind="{
          lg: true,
          disabled: !hash
        }"
        @click="onSubmit"
      >
        <span :class="{ 'text-gray-600': !hash }">
          {{ $t('guild.verifyJoinGuild.cta') }}
        </span>
      </AppButton>
    </div>
  </AppModal>
</template>
