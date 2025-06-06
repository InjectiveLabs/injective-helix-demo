<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { trackRefereeLoggedIn } from '@/app/providers/mixpanel/EventTracker'
import { Modal, MainPage } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const referralStore = useReferralStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const hasApproved = ref(false)
const status = reactive(new Status(StatusType.Idle))

const referralCode = computed(() =>
  typeof route.params?.ref === 'string' ? route.params.ref.toUpperCase() : ''
)

function connectWallet() {
  modalStore.closeModal(Modal.ConfirmReferral)

  if (GEO_IP_RESTRICTIONS_ENABLED && !appStore.userState.hasAcceptedTerms) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function approveReferral() {
  hasApproved.value = true

  if (sharedWalletStore.isUserConnected) {
    joinReferral()
  } else {
    connectWallet()
  }
}

function joinReferral() {
  status.setLoading()

  referralStore
    .registerInvitee(referralCode.value as string)
    .then(async () => {
      await referralStore.fetchUserReferrer()

      notificationStore.success({
        title: t('referral.success', { referralCode: referralCode.value })
      })

      trackRefereeLoggedIn({
        isSuccess: true,
        referralCode: referralCode.value as string,
        refereeAddress: sharedWalletStore.injectiveAddress
      })
    })
    .catch((e) => {
      trackRefereeLoggedIn({
        isSuccess: false,
        referralCode: referralCode.value as string,
        refereeAddress: sharedWalletStore.injectiveAddress
      })

      $onError(e)
    })
    .finally(() => {
      status.setIdle()
      router.push({ name: MainPage.Index })
    })
}

function checkJoinReferralEligibility() {
  referralStore
    .checkCodeAvailability(referralCode.value as string)
    .then((referrerAddress) => {
      if (referrerAddress !== sharedWalletStore.injectiveAddress) {
        joinReferral()
      }
    })
    .catch($onError)
}

onWalletConnected(() => {
  if (sharedWalletStore.isUserConnected && hasApproved.value) {
    checkJoinReferralEligibility()
  }
})
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.ConfirmReferral]"
    v-bind="{
      isAlwaysOpen: true,
      ui: { width: 'sm:max-w-xl' }
    }"
  >
    <h2 class="my-4 font-bold text-xl text-white text-center">
      {{ $t('referral.confirmReferral') }}
    </h2>

    <i18n-t
      tag="p"
      keypath="referral.confirmReferralDescription"
      class="text-sm text-coolGray-450 tracking-wide text-center"
    >
      <template #referralCode>
        <span class="text-white font-bold">{{ referralCode }}</span>
      </template>
    </i18n-t>

    <AppButton
      v-bind="{
        size: 'lg',
        isLoading: status.isLoading()
      }"
      class="font-semibold tracking-wide w-full mt-10"
      @click="approveReferral"
    >
      {{ $t('referral.approve') }}
    </AppButton>
  </AppModal>
</template>
