<template>
  <div>
    <div class="text-center">
      <div class="flex items-center justify-center">
        <p class="uppercase text-xs font-semibold text-gray-200">
          {{ $t('Available Margin') }}
        </p>
        <v-icon-info-tooltip
          class="ml-2 text-gray-200"
          :tooltip="$t('Available Margin Tooltip')"
        />
      </div>
      <div class="mt-4 text-center">
        <span
          class="font-mono flex items-center justify-center text-gray-200 text-base lg:text-xl"
        >
          {{ availableMarginToFormat }}
          <span class="text-gray-500 ml-2">{{ market.quoteToken.symbol }}</span>
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
              :rules="`required|positiveNumber|between:0.001,${availableMarginToString}`"
            >
              <v-input
                v-model="form.amount"
                :errors="status.isLoading() ? [] : errors"
                :valid="valid"
                :max="availableMarginToString"
                :max-selector="availableMargin.gt(0.01)"
                :label="$t('amount')"
                :placeholder="$t('Enter your amount')"
                type="number"
                step="0.001"
                min="0"
              >
                <span slot="addon">{{ market.quoteToken.symbol }}</span>
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
              {{ $t('add_margin') }}
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
import { Token, UiDerivativeMarket } from '~/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider
  },

  props: {
    balance: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    market: {
      required: true,
      type: Object as PropType<UiDerivativeMarket>
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
    availableMargin(): BigNumberInBase {
      const { balance } = this

      return balance
    },

    availableMarginToFormat(): string {
      const { availableMargin } = this

      return availableMargin.toFormat(
        UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    availableMarginToString(): string {
      const { availableMargin } = this

      return availableMargin.toFixed(
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
      const { form, market } = this

      this.status.setLoading()

      this.$accessor.derivatives
        .addMarginToPosition({
          market,
          amount: new BigNumberInBase(form.amount)
        })
        .then(() => {
          this.$toast.success(this.$t('success_added_margin'))
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
