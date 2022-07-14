<template>
  <VModal :is-open="isModalOpen" sm @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('referralModal.title') }}
    </h3>
    <p class="font-bold tracking-wide text-2xl -mt-2">
      {{ $t('referralModal.header') }}
    </p>
    <p class="my-4 text-sm tracking-wide">
      {{ $t('referralModal.usingReferCode') }}
    </p>

    <ValidationObserver v-slot="{ invalid }" ref="form">
      <ValidationProvider
        v-slot="{ errors, valid }"
        name="form.code"
        rules="required|referralCode"
      >
        <VInput
          v-model="form.code"
          :errors="metamaskStatus.isLoading() ? [] : errors"
          :valid="valid"
          :placeholder="$t('referralModal.enterCode')"
          dense
          lg
          error-below
        />
      </ValidationProvider>

      <div v-if="!isUserWalletConnected || metamaskStatus.isLoading()">
        <p class="my-6 text-sm tracking-wide">
          {{ $t('referralModal.connectTheWallet') }}
        </p>
        <div class="grid grid-cols-1 xs:grid-cols-2 gap-4">
          <VButton
            xl
            class="inline-flex items-center justify-center"
            light
            :status="metamaskStatus"
            @click="connectMetamask"
          >
            <IconMetamask class="w-6 h-6 mr-3" />
            <span class="font-bold tracking-widest">
              {{ $t('connect.metamask') }}
            </span>
          </VButton>

          <VButton
            xl
            class="inline-flex items-center justify-center"
            light
            :disabled="metamaskStatus.isLoading()"
            @click="connectLedger"
          >
            <IconLedger class="w-6 h-6 mr-3" />
            <span class="font-bold tracking-widest">
              {{ $t('connect.ledger') }}
            </span>
          </VButton>
        </div>
      </div>

      <div v-else>
        <div class="flex items-center my-6">
          <div
            class="bg-gray-200 mr-3 rounded-full h-10 w-10 flex items-center justify-center"
          >
            <IconMetamask
              v-if="connectedWalletType === Wallet.Metamask"
              class="w-6 h-6"
            />
            <IconLedger
              v-else-if="connectedWalletType === Wallet.Ledger"
              class="w-6 h-6 text-gray-700"
            />
          </div>
          <span class="text-xs tracking-wide">{{ injectiveAddress }}</span>
        </div>

        <VButton
          primary
          xl
          class="w-full"
          :disabled="invalid"
          :status="referStatus"
          @click="handleConfirm"
        >
          <span class="font-bold">
            {{ $t('referralModal.confirm') }}
          </span>
        </VButton>
      </div>
    </ValidationObserver>
  </VModal>
</template>

<script lang="ts">
import Vue from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { Status, StatusType } from '@injectivelabs/utils'
import { Wallet, AccountAddress } from '@injectivelabs/ts-types'
import { Modal, WalletConnectStatus } from '~/types'

export default Vue.extend({
  components: {
    ValidationProvider,
    ValidationObserver
  },

  data() {
    return {
      Wallet,
      referStatus: new Status(StatusType.Idle),
      metamaskStatus: new Status(StatusType.Idle),
      form: {
        code: ''
      }
    }
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.RefereeOnboarding]
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    injectiveAddress(): AccountAddress {
      return this.$accessor.wallet.injectiveAddress
    },

    connectedWalletType(): Wallet {
      return this.$accessor.wallet.wallet
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  mounted() {
    const { code } = this.$route.query

    if (code) {
      this.form.code = code as string
      this.$nextTick(() => {
        this.$form.validate()
      })
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.RefereeOnboarding)
      this.$accessor.modal.setPersistModal(undefined)
    },

    handleConfirm() {
      const { form } = this

      this.referStatus.setLoading()

      this.$accessor.referral
        .refer(form.code)
        .then(() => {
          if (this.$form) {
            this.$form.reset()
          }

          this.closeModal()
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.referStatus.setIdle()
        })
    },

    connectLedger() {
      this.$accessor.modal.setPersistModal(Modal.RefereeOnboarding)
      this.$accessor.modal.closeModal(Modal.RefereeOnboarding)
      this.$root.$emit('connect-ledger')
    },

    connectMetamask() {
      this.metamaskStatus.setLoading()
      this.$accessor.wallet
        .connectMetamask()
        .then(() => {
          this.metamaskStatus.setIdle()
        })
        .catch((e) => {
          this.$accessor.wallet.setWalletConnectStatus(
            WalletConnectStatus.disconnected
          )
          this.$onError(e)
        })
    }
  }
})
</script>
