<script lang="ts" setup>
import { Guild } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const route = useRoute()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()

const props = defineProps({
  isDisabled: Boolean,

  limit: {
    type: Number,
    required: true
  },

  guild: {
    type: Object as PropType<Guild>,
    required: true
  },

  guildInvitationHash: {
    type: String,
    required: true
  }
})

const status = reactive(new Status(StatusType.Idle))

onWalletConnected(() => {
  if (!walletStore.isUserWalletConnected) {
    return
  }

  if (props.isDisabled) {
    return
  }

  if (!route.query.invite || route.query.invite !== props.guildInvitationHash) {
    return
  }

  if (campaignStore.userGuildInfo) {
    modalStore.openModal(Modal.AlreadyJoinedGuild)

    return
  }

  modalStore.openModal(Modal.JoinGuild)
})

function onCloseModal() {
  modalStore.closeModal(Modal.JoinGuild)
}

function onSubmit() {
  status.setLoading()

  campaignStore
    .joinGuild({
      limit: props.limit,
      guildId: props.guild.guildId
    })
    .then(() => {
      notificationStore.success({
        title: t('guild.joinGuild.toast')
      })
      onCloseModal()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <AppModal
    is-sm
    :is-open="modalStore.modals[Modal.JoinGuild]"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <h2 class="text-xl font-semibold normal-case text-center">
        {{ $t('guild.joinGuild.title') }}
      </h2>
    </template>

    <div class="text-center">
      <PartialsGuildThumbnail
        class="mx-auto"
        is-xl
        :thumbnail-id="guild.logo"
      />

      <h3 class="text-lg font-semibold text-center mt-4">
        {{ guild.name }}
      </h3>

      <p class="mt-6">
        {{ $t('guild.joinGuild.description', { name: guild.name }) }}
      </p>

      <div class="mt-8 flex items-center gap-4">
        <AppButton
          class="w-full bg-blue-500 text-blue-900 font-semibold"
          v-bind="{
            isLg: true
          }"
          @click="onSubmit"
        >
          <span>
            {{ $t('guild.joinGuild.cta') }}
          </span>
        </AppButton>

        <AppButton
          class="w-full font-semibold border border-white"
          v-bind="{
            isLg: true
          }"
          @click="onSubmit"
        >
          <span>
            {{ $t('common.cancel') }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
