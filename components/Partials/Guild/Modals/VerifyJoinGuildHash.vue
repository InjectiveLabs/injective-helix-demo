<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()
const { validate, resetForm } = useForm()

const props = withDefaults(defineProps<{ invitationHash: string }>(), {})

const HASH_FIELD = 'hash'

const { value: hash, errors: hashErrors } = useStringField({
  name: HASH_FIELD
})

const hashMatches = computed(() => props.invitationHash === hash.value)

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
    is-sm
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
      is-sm
      wrapper-classes="p-2"
      :placeholder="$t('guild.verifyJoinGuild.hashPlaceholder')"
    />
    <p
      v-if="hashErrors[0]"
      class="text-red-500 first-letter:uppercase text-sm mt-1"
    >
      {{ hashErrors[0] }}
    </p>

    <div class="w-full mt-8 flex flex-col gap-1 items-center">
      <AppButton
        class="w-full bg-blue-500 text-blue-900 font-semibold"
        size="lg"
        v-bind="{
          disabled: !hash || !hashMatches
        }"
        @click="onSubmit"
      >
        <span v-if="hash && !hashMatches" class="text-coolGray-600">
          {{ $t('guild.verifyJoinGuild.incorrectCode') }}
        </span>

        <span v-else :class="{ 'text-coolGray-600': !hash }">
          {{ $t('guild.verifyJoinGuild.cta') }}
        </span>
      </AppButton>

      <NuxtLink
        target="_blank"
        class="text-blue-500 hover:text-opacity-80 text-sm"
        to="https://discord.com/channels/739552603322450092/1172055840606400563/"
      >
        {{ $t('guild.joinGuild.invitationCode') }}
      </NuxtLink>
    </div>
  </AppModal>
</template>
