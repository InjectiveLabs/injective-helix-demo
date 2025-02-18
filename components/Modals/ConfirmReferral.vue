<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { Modal, MainPage } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

const status = reactive(new Status(StatusType.Idle))

// todo fred: implement checker whether code is exist when BE ready
const referralCode = computed(() => route.params.ref)

function approveReferral() {
  status.setLoading()

  // todo fred: implement grpc/api call to "approve" when BE ready
  connectWallet()

  status.setIdle()
}

function connectWallet() {
  if (GEO_IP_RESTRICTIONS_ENABLED && !appStore.userState.hasAcceptedTerms) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

onWalletConnected(() => {
  if (sharedWalletStore.isUserConnected) {
    router.push({ name: MainPage.Referral })
  }
})
</script>

<template>
  <SharedModal
    v-model="modalStore.modals[Modal.ConfirmReferral]"
    :ui="{ width: 'sm:max-w-xl' }"
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
  </SharedModal>
</template>
