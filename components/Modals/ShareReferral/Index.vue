<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Modal } from '@/types'

const siteFullUrl = useRequestURL()
const referralStore = useReferralStore()
const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const customText = ref(t('referral.shareModal.defaultText'))

const qrCodeText = computed(() => `${customText.value} ${referralLink.value}`)

const actionButtons = computed(() => {
  const extraPrefix = `url=${encodeURIComponent(
    referralLink.value
  )}&text=${encodeURIComponent(customText.value)}`

  const twitterLink = `https://twitter.com/share?${extraPrefix}`
  const telegramLink = `https://telegram.me/share/url?${extraPrefix}`

  return [
    {
      icon: NuxtUiIcons.Copy3,
      href: ''
    },
    {
      icon: NuxtUiIcons.TwitterX,
      href: twitterLink
    },
    {
      icon: NuxtUiIcons.Telegram,
      href: telegramLink
    }
  ]
})

const referralLink = computed(
  () =>
    `${siteFullUrl.origin}/ref/${
      referralStore.referralDetails?.referrerCode || ''
    }`
)

function onCopyLink() {
  copy(referralLink.value).then(() =>
    notificationStore.success({
      title: t('referral.referralLinkCopied')
    })
  )
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.ShareReferral]"
    v-bind="{
      ui: { width: 'sm:w-96' },
      cardUi: { background: 'dark:bg-[#181A21]' }
    }"
  >
    <template #title>
      <h2 class="text-lg font-semibold leading-none capitalize">
        {{ $t('referral.shareModal.title') }}
      </h2>
    </template>

    <div class="w-full max-w-80 flex flex-col items-center mx-auto">
      <h5 class="text-center text-sm font-semibold">
        {{ $t('referral.shareModal.description') }}
      </h5>

      <PartialsReferralQRCode
        :text="qrCodeText"
        class="max-w-56 my-4 rounded-lg"
      />

      <div
        class="py-3 px-5 bg-brand-900 border border-[#181E31] rounded w-full"
      >
        <p class="mb-0.5 text-coolGray-450 text-xs">
          {{ $t('referral.shareModal.customizeYourText') }}
        </p>
        <SharedTextArea v-model="customText" class="text-sm" :rows="4" />
      </div>

      <div
        class="py-3 px-5 bg-brand-900 border border-[#181E31] rounded w-full my-4"
      >
        <p class="mb-0.5 text-coolGray-450 text-xs">
          {{ $t('referral.referralLink') }}
        </p>
        <p class="text-sm break-words">{{ referralLink }}</p>
      </div>

      <div class="flex gap-2">
        <ModalsShareReferralActionButton
          v-for="(item, index) in actionButtons"
          :key="index"
          v-bind="{ item }"
          @copyLink="onCopyLink"
        />
      </div>
    </div>
  </AppModal>
</template>
