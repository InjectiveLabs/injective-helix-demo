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

const referralCode = computed(() => route.params.ref)

function checkReferralCode() {
  status.setLoading()

  referralStore
    .checkCodeAvailability(referralCode.value as string)
    .then((referrerAddress) => {
      if (referrerAddress === sharedWalletStore.injectiveAddress) {
        notificationStore.error({
          title: t('referral.unableToJoinReferral')
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
    .finally(() => {
      status.setIdle()
    })
}

onMounted(() => {
  if (referralCode.value) {
    checkReferralCode()
  }
})
</script>

<template>
  <div>
    <AppHocLoading :status="status" is-full-screen />
    <ModalsConfirmReferral />
  </div>
</template>
