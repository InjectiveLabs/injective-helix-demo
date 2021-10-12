<template>
  <div>
    <div class="text-center">
      <div class="flex items-center justify-center">
        <p class="uppercase text-xs font-semibold text-gray-200">
          {{ $t('Available to Withdraw') }}
        </p>
        <v-icon-info-tooltip
          class="ml-2 text-gray-200"
          :tooltip="
            $t('Available to Withdraw Subaccount Tooltip', {
              asset: token.symbol
            })
          "
        />
      </div>
      <div class="mt-4 text-center">
        <span
          class="font-mono flex items-center justify-center text-gray-200 text-base lg:text-xl"
        >
          {{ availableForWithdrawToFormat }}
          <span class="text-gray-500 ml-2">{{ token.symbol }}</span>
        </span>
      </div>
    </div>

    <div class="mt-4">
      <ValidationObserver v-slot="{ invalid }" ref="form">
        <div class="flex flex-wrap">
          <div class="w-full">
            <ValidationProvider
              v-slot="{ errors, valid }"
              name="form.amount"
              :rules="`required|positiveNumber|between:0.001,${availableForWithdrawToString}`"
            >
              <v-input
                v-model="form.amount"
                :errors="status.isLoading() ? [] : errors"
                :valid="valid"
                :max="availableForWithdrawToString"
                :max-selector="availableForWithdraw.gt(0.01)"
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
              @click.stop="handleClickOnWithdraw"
            >
              {{ $t('withdraw') }}
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
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

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
      status: new Status(),

      form: {
        amount: ''
      }
    }
  },

  computed: {
    availableForWithdraw(): BigNumberInBase {
      const { balance } = this

      return balance
    },

    availableForWithdrawToFormat(): string {
      const { availableForWithdraw } = this

      return availableForWithdraw.toFormat(
        UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    availableForWithdrawToString(): string {
      const { availableForWithdraw } = this

      return availableForWithdraw.toFixed(
        UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  methods: {
    handleClickOnWithdraw() {
      const { form, token } = this

      this.status.setLoading()

      this.$accessor.account
        .withdraw({
          amount: new BigNumberInBase(form.amount),
          token
        })
        .then(() => {
          this.$toast.success(this.$t('success_withdraw'))
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
