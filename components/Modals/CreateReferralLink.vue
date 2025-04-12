<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { trackReferralCodeCreated } from '@/app/providers/mixpanel/EventTracker'
import { Modal } from '@/types'
import { errorMessages } from '@/plugins/validation'

const referralStore = useReferralStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const {
  value: referralCode,
  errors: referralCodeErrors,
  setValue: setReferralCodeValue
} = useStringField({
  name: 'referralCode',
  rule: 'required|alphanumeric|maxCharacter:32'
})

const referralInputRef = ref()
const isLinkAvailable = ref(false)
const status = reactive(new Status(StatusType.Idle))

const uppercaseReferralCode = computed({
  get: () => referralCode.value,
  set: (value) => setReferralCodeValue(value.toUpperCase())
})

const instructionText = computed(() =>
  referralCodeErrors.value?.[0] === errorMessages.maxCharacter()
    ? t('referral.referralCodeMaxLengthMessage')
    : t('referral.lettersAndNumbersOnly')
)

function checkAvailability() {
  status.setLoading()

  referralStore
    .checkCodeAvailability(referralCode.value)
    .then((referrerAddress) => {
      if (!referrerAddress) {
        isLinkAvailable.value = true
      } else {
        notificationStore.error({
          title: t('referral.referralLinkIsUnavailable')
        })
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function generateLink() {
  status.setLoading()

  referralStore
    .createReferralLink(referralCode.value)
    .then(async () => {
      await referralStore.fetchUserReferralDetails()

      trackReferralCodeCreated({
        isSuccess: true,
        referralCode: referralCode.value,
        refereeAddress: sharedWalletStore.injectiveAddress
      })

      modalStore.openModal(Modal.ShareReferral)
      resetData()
      modalStore.closeModal(Modal.CreateReferralLink)
    })
    .catch((e) => {
      trackReferralCodeCreated({
        isSuccess: false,
        referralCode: referralCode.value,
        refereeAddress: sharedWalletStore.injectiveAddress
      })

      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function resetData() {
  isLinkAvailable.value = false
  setReferralCodeValue('')
}

function focusInput() {
  referralInputRef.value?.$el?.querySelector('.input-base')?.focus()
}

watch(
  () => modalStore.modals[Modal.CreateReferralLink],
  async () => {
    if (modalStore.modals[Modal.CreateReferralLink]) {
      await nextTick()
      focusInput()
    }
  }
)
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.CreateReferralLink]"
    :ui="{ width: 'sm:max-w-xl' }"
    @on:open="resetData"
  >
    <div v-if="isLinkAvailable">
      <CommonSuccessMessage>
        <template #default>
          <h2 class="my-4 font-bold text-xl text-white">
            {{ $t('referral.referralLinkAvailable') }}
          </h2>

          <i18n-t
            tag="p"
            keypath="referral.referralLinkAvailableDescription"
            class="text-sm text-coolGray-450 tracking-wide"
          >
            <template #referralCode>
              <span class="text-white font-bold">{{ referralCode }}</span>
            </template>
          </i18n-t>
        </template>
      </CommonSuccessMessage>

      <AppButton
        v-bind="{
          size: 'lg',
          isLoading: status.isLoading()
        }"
        class="font-semibold tracking-wide w-full mt-10 mb-2"
        @click="generateLink"
      >
        {{ $t('referral.confirmAndGenerateLink') }}
      </AppButton>

      <AppButton
        v-bind="{
          size: 'lg',
          variant: 'primary-outline',
          isLoading: status.isLoading()
        }"
        class="font-semibold tracking-wide w-full"
        @click="resetData"
      >
        {{ $t('referral.chooseDifferentLink') }}
      </AppButton>
    </div>

    <div v-else>
      <h2 class="text-coolGray-200 text-xl font-bold">
        {{ $t('referral.createReferralLinkTitle') }}
      </h2>
      <p class="text-coolGray-450 text-sm tracking-wide my-4 leading-tight">
        {{ $t('referral.createReferralLinkSubtitle') }}
      </p>

      <div>
        <p class="text-xs font-semibold tracking-wide mb-2 rounded">
          {{ $t('referral.customReferralCode') }}
        </p>

        <AppInput
          ref="referralInputRef"
          v-model="uppercaseReferralCode"
          v-bind="{
            isNoPadding: true,
            disabled: status.isLoading(),
            placeholder: $t('referral.createReferralLinkPlaceholder'),
            inputClasses: 'placeholder-coolGray-475 w-auto max-sm:min-w-28 ',
            wrapperClasses:
              'bg-brand-875 p-4 border border-brand-725 rounded text-sm text-coolGray-475 font-mono overflow-auto'
          }"
        >
          <template #prefix>
            <span
              class="text-coolGray-650 whitespace-nowrap"
              @click="focusInput"
            >
              https://helixapp.com/ref/
            </span>
          </template>
        </AppInput>

        <p
          :class="[
            referralCodeErrors?.length > 0
              ? 'text-red-550'
              : 'text-coolGray-475',
            'text-right font-mono text-xs my-4'
          ]"
        >
          {{ instructionText }}
        </p>

        <AppButton
          v-bind="{
            size: 'lg',
            isLoading: status.isLoading(),
            disabled: !referralCode || referralCodeErrors?.length > 0
          }"
          class="font-semibold tracking-wide w-full"
          @click="checkAvailability"
        >
          {{ $t('referral.checkAvailability') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
