<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/wallet-ts'
import { Modal, WalletConnectStatus } from '@/types'

/*
Todo: check with product if we should support all wallet types fro referral
*/

const route = useRoute()
const modalStore = useModalStore()
const referralStore = useReferralStore()
const walletStore = useWalletStore()
const { t } = useLang()
const { error } = useNotifications()
const { $onError } = useNuxtApp()
const { handleSubmit, resetForm } = useForm()

const status = new Status(StatusType.Idle)
const metamaskStatus = new Status(StatusType.Idle)

const showModal = computed(() => modalStore.modals[Modal.RefereeOnboarding])
const { value: referralCode, errors: referralCodeErrors } = useStringField({
  name: 'referralCode',
  rule: 'required|referralCode'
})

onMounted(() => {
  const { code } = route.query
  const codeNormalized = code ? code.toString().trim() : ''

  if (route.name === 'register' && codeNormalized) {
    referralCode.value = codeNormalized

    if (referralStore.refereeInfo) {
      error({
        title: t('referralModal.alreadyReferredToast')
      })
    } else {
      modalStore.openModal({ type: Modal.RefereeOnboarding })
    }
  }
})

function close() {
  modalStore.closeModal(Modal.RefereeOnboarding)

  modalStore.$patch({
    persistModal: undefined
  })
}

const confirm = handleSubmit(() => {
  status.setLoading()

  referralStore
    .refer(referralCode.value)
    .then(() => {
      resetForm()
      close()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

function connectLedger() {
  // https://github.com/InjectiveLabs/injective-helix/blob/505435db18157d3c94905823b91faf2f29e24148/components/partials/modals/referee-onboarding.vue#L182
  modalStore.$patch({
    persistModal: Modal.RefereeOnboarding
  })
  modalStore.closeModal(Modal.RefereeOnboarding)
}

function connectMetamask() {
  metamaskStatus.setLoading()

  walletStore
    .connectMetamask()
    .catch((e) => {
      walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
      $onError(e)
    })
    .finally(() => metamaskStatus.setIdle())
}
</script>

<template>
  <AppModalWrapper :show="showModal" sm @modal:closed="close">
    <template #title>
      <h3>
        {{ $t('referralModal.title') }}
      </h3>
    </template>

    <div>
      <p class="font-bold tracking-wide text-2xl -mt-2">
        {{ $t('referralModal.header') }}
      </p>
      <p class="my-4 text-sm tracking-wide">
        {{ $t('referralModal.usingReferCode') }}
      </p>

      <AppInput
        v-model="referralCode"
        :errors="metamaskStatus.isLoading() ? [] : referralCodeErrors"
        :placeholder="$t('referralModal.enterCode')"
        lg
      />

      <p
        v-if="referralCodeErrors.length > 0"
        class="capitalize-phrase text-sm text-red-500 mt-2"
      >
        {{ referralCodeErrors[0] }}
      </p>

      <div v-if="!walletStore.isUserWalletConnected">
        <p class="my-6 text-sm tracking-wide">
          {{ $t('referralModal.connectTheWallet') }}
        </p>
        <div class="grid grid-cols-1 xs:grid-cols-2 gap-4">
          <AppButton
            xl
            class="bg-blue-500 text-blue-900"
            :status="metamaskStatus"
            @click="connectMetamask"
          >
            <div class="flex items-center justify-center gap-1">
              <BaseIcon name="wallet/metamask" class="w-6 h-6" />
              <span class="font-bold tracking-widest">
                {{ $t('connect.metamask') }}
              </span>
            </div>
          </AppButton>

          <AppButton
            xl
            class="bg-blue-500 text-blue-900"
            :disabled="metamaskStatus.isLoading()"
            @click="connectLedger"
          >
            <div class="flex items-center justify-center gap-1">
              <BaseIcon name="wallet/ledger" class="w-6 h-6 mr-3" />
              <span class="font-bold tracking-widest">
                {{ $t('connect.ledger') }}
              </span>
            </div>
          </AppButton>
        </div>
      </div>

      <div v-else>
        <div class="flex items-center my-6">
          <div
            class="bg-gray-200 mr-3 rounded-full h-10 w-10 flex items-center justify-center"
          >
            <BaseIcon
              v-if="walletStore.wallet === Wallet.Metamask"
              name="wallet/metamask"
              class="w-6 h-6"
            />
            <BaseIcon
              v-else-if="walletStore.wallet === Wallet.Ledger"
              name="wallet/ledger"
              class="w-6 h-6 text-gray-700"
            />
          </div>
          <span class="text-xs tracking-wide">
            {{ walletStore.injectiveAddress }}
          </span>
        </div>

        <AppButton
          xl
          class="w-full text-white bg-blue-500"
          :disabled="referralCodeErrors.length > 0"
          :status="status"
          @click="confirm"
        >
          <span class="font-bold">
            {{ $t('referralModal.confirm') }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModalWrapper>
</template>
