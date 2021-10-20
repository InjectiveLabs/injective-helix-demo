<template>
  <div>
    <div class="text-center">
      <div class="flex items-center justify-center">
        <p class="uppercase text-xs font-semibold text-gray-200">
          {{ $t('Available for Deposit') }}
        </p>
        <v-icon-info-tooltip
          class="ml-2 text-gray-200"
          :tooltip="
            $t('Available for Deposit Tooltip', { asset: token.symbol })
          "
        />
      </div>
      <div class="mt-4 text-center">
        <span
          class="font-mono flex items-center justify-center text-gray-200 text-base lg:text-xl"
        >
          {{ availableForDepositToFormat }}
          <span class="text-gray-500 ml-2">{{ token.symbol }}</span>
        </span>
        <p
          v-if="token.denom === INJECTIVE_DENOM"
          class="mt-2 text-left text-xs text-gray-400"
        >
          * {{ $t('Buffer for gas note') }}
        </p>
      </div>
    </div>

    <div class="mt-4">
      <ValidationObserver v-slot="{ invalid }" ref="form">
        <div class="flex flex-wrap">
          <div class="w-full">
            <ValidationProvider
              v-slot="{ errors, valid }"
              name="form.amount"
              :rules="`required|positiveNumber|between:0.001,${availableForDepositToString}`"
            >
              <v-input
                v-model="form.amount"
                :errors="status.isLoading() ? [] : errors"
                :valid="valid"
                :max="availableForDepositToString"
                :max-selector="availableForDeposit.gt(0.01)"
                :label="$t('amount')"
                :placeholder="$t('Enter your amount')"
                type="number"
                step="0.001"
                min="0"
              >
                <span slot="addon">{{ token.symbol }}</span>
              </v-input>
            </ValidationProvider>
          </div>
          <div class="w-full mt-6 text-center">
            <v-button
              lg
              class="w-full"
              :status="status"
              :primary="!invalid"
              :disabled="!form.amount || invalid"
              @click.stop="handleClickOnDeposit"
            >
              {{ $t('Deposit') }}
            </v-button>
          </div>
        </div>
      </ValidationObserver>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { TokenWithBalance } from '~/types'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  INJECTIVE_DENOM,
  INJ_FEE_BUFFER,
  ZERO_IN_BASE
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider
  },

  props: {
    token: {
      required: true,
      type: Object as PropType<TokenWithBalance>
    },

    balance: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    }
  },

  data() {
    return {
      INJECTIVE_DENOM,
      status: new Status(),

      form: {
        amount: ''
      }
    }
  },

  computed: {
    availableForDeposit(): BigNumberInBase {
      const { balance, token } = this

      return balance.gt(INJ_FEE_BUFFER) && token.denom === INJECTIVE_DENOM
        ? balance.minus(INJ_FEE_BUFFER)
        : balance
    },

    availableForDepositToFormat(): string {
      const { availableForDeposit } = this

      return availableForDeposit.toFormat(
        UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    availableForDepositToString(): string {
      const { availableForDeposit } = this

      return availableForDeposit.toFixed(
        UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  methods: {
    handleClickOnDeposit() {
      const { form, token } = this

      this.status.setLoading()

      this.$accessor.account
        .deposit({
          amount: new BigNumberInBase(form.amount),
          token
        })
        .then(() => {
          this.$toast.success(this.$t('success_deposit'))
          this.form.amount = ''

          if (this.$form) {
            this.$form.reset()
          }
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
