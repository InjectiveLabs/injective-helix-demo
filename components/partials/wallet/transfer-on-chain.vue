<template>
  <v-card class="relative h-full">
    <div v-if="isUserWalletConnected">
      <div class="text-center">
        <div class="flex items-center justify-center">
          <p class="uppercase text-xs font-semibold text-gray-200">
            {{ $t('Available to Transfer On Chain') }}
          </p>
          <v-icon-info-tooltip
            lg
            class="ml-2"
            :tooltip="$t('Available to Transfer On Chain Tooltip')"
          />
        </div>
        <div class="mt-4 text-center">
          <span
            class="font-mono flex items-center justify-center text-gray-200 text-2xl"
          >
            {{ balanceToString }}
            <span class="text-gray-500 ml-2">{{
              currentBalanceWithTokenMeta
                ? currentBalanceWithTokenMeta.token.symbol
                : ''
            }}</span>
          </span>
        </div>
      </div>
      <ValidationObserver v-slot="{ invalid }" ref="form">
        <div class="mt-6">
          <div class="w-full">
            <ValidationProvider
              v-slot="{ errors, valid }"
              name="form.amount"
              :rules="`required|positiveNumber|between:0.0001,${balanceWithGasBufferToFixed}`"
            >
              <v-input
                v-model="form.amount"
                :errors="status.isLoading() ? [] : errors"
                :valid="valid"
                :max="balanceWithGasBufferToFixed"
                :max-selector="balance.gt(0.01)"
                :label="$t('amount')"
                :placeholder="$t('Enter amount')"
                type="number"
                step="0.01"
                min="0"
              >
                <span v-if="currentBalanceWithTokenMeta" slot="addon">{{
                  currentBalanceWithTokenMeta.token.symbol
                }}</span>
              </v-input>
            </ValidationProvider>
          </div>
          <div class="mt-6 w-full">
            <ValidationProvider
              v-slot="{ errors, valid }"
              name="form.denom"
              :rules="`required`"
            >
              <v-select-custom
                v-model="form.denom"
                :errors="status.isLoading() ? [] : errors"
                :valid="valid"
                :options="
                  balancesWithTokenMetaData.map((a) => ({
                    code: a.denom,
                    label: a.token.symbol.toUpperCase()
                  }))
                "
                :label="$t('asset')"
                :placeholder="$t('Asset Transfer Tooltip')"
              >
              </v-select-custom>
            </ValidationProvider>
          </div>
          <div class="mt-6 w-full">
            <ValidationProvider
              v-slot="{ errors, valid }"
              name="form.destination"
              :rules="`required|injaddress`"
            >
              <v-input
                v-model="form.destination"
                :errors="status.isLoading() ? [] : errors"
                :valid="valid"
                placeholder="inj"
                :label="$t('Injective Address Destination')"
              >
              </v-input>
            </ValidationProvider>
          </div>
          <div
            class="w-full mt-6 text-center md:w-2/3 md:mx-auto lg:w-full 4xl:w-2/3"
          >
            <v-button
              lg
              class="w-full"
              :status="status"
              :primary="!invalid"
              :disabled="
                !form.amount || !form.destination || !form.denom || invalid
              "
              @click.stop="handleClickOnTransfer"
            >
              {{ $t('transfer') }}
            </v-button>
          </div>
        </div>
      </ValidationObserver>
    </div>
    <v-user-wallet-connect-warning v-else />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import VSelectCustom from '~/components/inputs/select-custom.vue'
import {
  INJECTIVE_DENOM,
  INJ_FEE_BUFFER,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import { BankBalanceWithTokenMetaData } from '~/types'

export default Vue.extend({
  components: {
    ValidationProvider,
    ValidationObserver,
    VSelectCustom
  },

  data() {
    return {
      status: new Status(),

      form: {
        denom: '',
        amount: '',
        destination: ''
      }
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    balancesWithTokenMetaData(): BankBalanceWithTokenMetaData[] {
      return this.$accessor.bank.balancesWithTokenMetaData
    },

    address(): string {
      return this.$accessor.wallet.address
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    currentBalanceWithTokenMeta(): BankBalanceWithTokenMetaData | undefined {
      const { balancesWithTokenMetaData, form } = this

      return balancesWithTokenMetaData.find(
        (balance) => balance.denom === form.denom
      )
    },

    balance(): BigNumberInBase {
      const { currentBalanceWithTokenMeta } = this

      if (!currentBalanceWithTokenMeta) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(currentBalanceWithTokenMeta.balance).toBase(
        currentBalanceWithTokenMeta.token.decimals
      )
    },

    balanceToString(): string {
      const { balance } = this

      return balance.toFormat(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    balanceWithGasBuffer(): BigNumberInBase {
      const { balance, form } = this

      if (form.denom !== INJECTIVE_DENOM) {
        return balance
      }

      return balance.gt(INJ_FEE_BUFFER)
        ? balance.minus(INJ_FEE_BUFFER)
        : ZERO_IN_BASE
    },

    balanceWithGasBufferToFixed(): string {
      const { balanceWithGasBuffer } = this

      return balanceWithGasBuffer.toFixed(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    balanceWithGasBufferToString(): string {
      const { balanceWithGasBuffer } = this

      return balanceWithGasBuffer.toFormat(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  methods: {
    handleClickOnTransfer() {
      const { form, currentBalanceWithTokenMeta } = this

      if (!currentBalanceWithTokenMeta) {
        return
      }

      this.status.setLoading()

      this.$accessor.bank
        .transfer({
          token: currentBalanceWithTokenMeta.token,
          denom: currentBalanceWithTokenMeta.denom,
          destination: form.destination,
          amount: new BigNumberInBase(form.amount)
        })
        .then(() => {
          this.$toast.success(this.$t('Successfully Transferred'))
          this.form.denom = ''
          this.form.amount = ''
          this.form.destination = ''

          if (this.$form) {
            this.$form.reset()
          }
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
