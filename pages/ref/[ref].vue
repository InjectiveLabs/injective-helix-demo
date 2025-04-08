<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal, MainPage } from '@/types'

const route = useRoute()
const router = useRouter()
const modalStore = useSharedModalStore()
const referralStore = useReferralStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const referralCode = computed(() =>
  typeof route.params?.ref === 'string' ? route.params.ref.toUpperCase() : ''
)

function checkReferralCode() {
  referralStore
    .checkCodeAvailability(referralCode.value as string)
    .then((referrerAddress) => {
      if (
        referrerAddress &&
        referrerAddress === sharedWalletStore.injectiveAddress
      ) {
        notificationStore.error({
          title: t('referral.joinSelfReferralMessage')
        })

        router.push({ name: MainPage.Index })
      } else if (referrerAddress) {
        modalStore.openModal(Modal.ConfirmReferral)
      } else {
        notificationStore.error({
          title: t('referral.referralLinkIsUnavailable')
        })

        router.push({ name: MainPage.Index })
      }
    })
    .catch($onError)
}

onWalletConnected(() => {
  if (referralCode.value) {
    checkReferralCode()
  }
})
</script>

<template>
  <div>
    <AppHocLoading v-bind="{ status, isFullScreen: true }" />
    <ModalsConfirmReferral />
  </div>
</template>
