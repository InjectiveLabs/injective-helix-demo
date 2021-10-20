<template>
  <div>
    <div v-if="allowance.gt(0)">
      <div class="text-center">
        <div class="flex items-center justify-center">
          <p class="uppercase text-xs font-semibold text-gray-200">
            {{ $t('Available for Deposit') }}
          </p>
          <v-icon-info-tooltip
            class="ml-2 text-gray-200"
            :tooltip="
              $t('Available for Deposit Tooltip', {
                asset: token.symbol
              })
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
    <div v-else>
      <v-allowance v-if="token" :token="token" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import VAllowance from './allowance.vue'
import { UiSpotMarket, TokenWithBalance } from '~/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider,
    VAllowance
  },

  props: {
    token: {
      required: true,
      type: Object as PropType<TokenWithBalance>
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
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    },

    availableForDeposit(): BigNumberInBase {
      const { token } = this

      return new BigNumberInWei(token.balance || 0).toBase(token.decimals)
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

    allowance(): BigNumberInBase {
      const { token } = this

      return new BigNumberInWei(token.allowance).toBase()
    }
  },

  methods: {
    handleClickOnDeposit() {
      const { form, token } = this

      this.status.setLoading()

      this.$accessor.token
        .transfer({
          amount: new BigNumberInBase(form.amount),
          token
        })
        .then(() => {
          this.$toast.success(this.$t('success_transfer'))
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
