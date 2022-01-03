<template>
  <v-modal
    :is-open="isDelegateModalOpen"
    @modal-closed="handleDelegateModalClosed"
  >
    <h3 slot="title">
      {{
        $t('Delegate To {validator}', {
          validator: validator ? validator.name : ''
        })
      }}
    </h3>
    <div class="relative mt-6">
      <div class="text-center">
        <div class="flex items-center justify-center">
          <p class="uppercase text-xs font-semibold text-gray-200">
            {{ $t('Available for Delegation') }}
          </p>
          <v-icon-info-tooltip
            class="ml-2 text-gray-200"
            :tooltip="$t('Available for Delegation Tooltip')"
          />
        </div>
        <div class="mt-4 text-center">
          <span
            class="font-mono flex items-center justify-center text-gray-200 text-2xl"
          >
            {{ availableForDelegationToString }}
            <span class="text-gray-500 ml-2">INJ</span>
          </span>
          <p
            class="mt-2 text-left text-xs text-gray-400 w-full mx-auto lg:w-2/3"
          >
            * {{ $t('Buffer for gas note') }}
          </p>
        </div>
      </div>

      <div class="mt-4 mb-6 px-4">
        <ValidationObserver v-slot="{ invalid }" ref="form">
          <div class="flex flex-wrap -mx-4">
            <div class="w-full px-4">
              <ValidationProvider
                v-slot="{ errors, valid }"
                name="form.amount"
                :rules="`required|positiveNumber|between:0.0001,${availableForDelegationWithGasBufferToFixed}`"
              >
                <v-input
                  v-model="form.amount"
                  :errors="status.isLoading() ? [] : errors"
                  :valid="valid"
                  :max="availableForDelegationWithGasBufferToFixed"
                  :max-selector="availableForDelegation.gt(0.01)"
                  :label="$t('amount')"
                  :placeholder="$t('Enter your amount to be delegated')"
                  type="number"
                  step="0.01"
                  min="0"
                >
                  <span slot="addon">INJ</span>
                </v-input>
              </ValidationProvider>
            </div>
            <div class="w-full px-4 mt-4 text-center">
              <v-button
                lg
                class="w-full"
                :status="status"
                :primary="!invalid"
                :disabled="!form.amount || invalid"
                @click.stop="handleClickOnDelegate"
              >
                {{ $t('Delegate') }}
              </v-button>
            </div>
          </div>
        </ValidationObserver>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  INJ_FEE_BUFFER,
  INJECTIVE_DENOM
} from '~/app/utils/constants'
import { UiValidator } from '~/types/validators'
import { Modal } from '~/types/enums'
import { BankBalances } from '~/types'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider
  },

  props: {
    validator: {
      required: false,
      type: Object as PropType<UiValidator>,
      default: undefined
    }
  },

  data() {
    return {
      status: new Status(),

      form: {
        amount: ''
      }
    }
  },

  computed: {
    balances(): BankBalances {
      return this.$accessor.bank.balances
    },

    availableForDelegation(): BigNumberInBase {
      const { balances } = this

      return new BigNumberInWei(balances[INJECTIVE_DENOM] || 0).toBase()
    },

    availableForDelegationToString(): string {
      const { availableForDelegation } = this

      return availableForDelegation.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    availableForDelegationWithGasBuffer(): BigNumberInBase {
      const { availableForDelegation } = this

      return availableForDelegation.minus(INJ_FEE_BUFFER)
    },

    availableForDelegationWithGasBufferToFixed(): string {
      const { availableForDelegationWithGasBuffer } = this

      return availableForDelegationWithGasBuffer.toFixed(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    availableForDelegationWithGasBufferToString(): string {
      const { availableForDelegationWithGasBuffer } = this

      return availableForDelegationWithGasBuffer.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    isDelegateModalOpen(): boolean {
      const { validator } = this

      return (
        this.$accessor.modal.modals[Modal.DelegateToValidator] &&
        validator !== undefined
      )
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  methods: {
    handleDelegateModalClosed() {
      this.$accessor.modal.closeModal(Modal.DelegateToValidator)
      this.$emit('modal-closed')
    },

    handleClickOnDelegate() {
      const { form, validator } = this

      this.status.setLoading()

      this.$accessor.staking
        .delegateToValidator({
          validatorAddress: validator.address,
          amount: new BigNumberInBase(form.amount)
        })
        .then(() => {
          this.$toast.success(this.$t('Successfully Staked'))
          this.form.amount = ''

          if (this.$form) {
            this.$form.reset()
          }
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
          this.$nextTick(() => {
            this.handleDelegateModalClosed()
          })
        })
    }
  }
})
</script>
