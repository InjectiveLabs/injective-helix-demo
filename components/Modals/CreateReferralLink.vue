<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const referralStore = useReferralStore()
const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const {
  value: referralCode,
  errors: referralCodeErrors,
  setValue: setReferralCodeValue
} = useStringField({
  name: 'referralCode',
  rule: 'required|alphanumeric'
})

const isLinkAvailable = ref(false)
const status = reactive(new Status(StatusType.Idle))

function checkAvailability() {
  status.setLoading()

  referralStore
    .checkCodeAvailability(referralCode.value)
    .then((isAvailable) => {
      if (isAvailable) {
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

      // todo fred: replace this "temp notification" with "showing share modal" - KIV until design is refined/ready
      notificationStore.success({
        title: `Successfully created "${referralCode.value}"" referral code!`
      })

      resetData()
      modalStore.closeModal(Modal.CreateReferralLink)
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function resetData() {
  isLinkAvailable.value = false
  setReferralCodeValue('')
}
</script>

<template>
  <SharedModal
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
          v-model="referralCode"
          v-bind="{
            isNoPadding: true,
            disabled: status.isLoading(),
            placeholder: $t('referral.createReferralLinkPlaceholder'),
            inputClasses: 'placeholder-coolGray-475 w-auto max-sm:min-w-28',
            wrapperClasses:
              'bg-brand-875 p-4 border border-brand-725 rounded text-sm text-coolGray-475 font-mono overflow-auto'
          }"
        >
          <template #prefix>
            <span class="text-coolGray-650 whitespace-nowrap">
              https://helix.app.com/ref/
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
          {{ $t('referral.lettersAndNumbersOnly') }}
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
  </SharedModal>
</template>
