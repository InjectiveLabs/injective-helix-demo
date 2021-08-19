<template>
  <div v-if="market" class="p-4">
    <div class="px-2 -mb-2">
      <v-ui-text-info :title="$t('available_balance')">
        <span v-if="balanceToString">{{ balanceToString }}</span>
        <span v-else class="text-gray-400 font-normal text-xs">&mdash;</span>
      </v-ui-text-info>

      <ValidationObserver v-slot="{ invalid }" ref="form">
        <ValidationProvider
          v-slot="{ errors, valid }"
          name="form.amount"
          :rules="`required|positiveNumber|between:0.0001,${balanceToString}`"
        >
          <v-input
            v-model="form.amount"
            :errors="status.isLoading() ? [] : errors"
            :valid="valid"
            :max="balanceToString"
            :max-selector="!!balanceToString"
            :placeholder="$t('amount_to_transfer')"
            class="mt-4"
            type="number"
            step="0.0001"
            min="0"
            @blur="onBlur"
          >
            <span slot="addon">{{
              market ? market.quoteToken.symbol : ''
            }}</span>
          </v-input>
          <v-ui-text xs muted class="flex items-center mt-1">
            {{
              $t('small_bridge_fee_note', {
                fee: bridgeFee.toFixed(),
                asset: market ? market.quoteToken.symbol : ''
              })
            }}
          </v-ui-text>
          <v-ui-text xs muted class="flex items-center mt-2">
            {{
              $t('small_gas_fee_note', {
                fee: gas.toFixed(),
                asset: 'INJ'
              })
            }}
          </v-ui-text>
          <div class="w-full mx-auto mt-4">
            <v-ui-button
              :status="status"
              full
              :primary="valid"
              :ghost="invalid"
              :disabled="!form.amount || invalid"
              @click.stop="handleWithdrawClick"
            >
              {{ $t('withdraw') }}
            </v-ui-button>
          </div>
        </ValidationProvider>
      </ValidationObserver>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import {
  BigNumberInBase,
  BigNumberInWei,
  DEFAULT_BRIDGE_FEE_PRICE,
  DEFAULT_GAS_LIMIT,
  Status
} from '@injectivelabs/utils'
import { UiSpotMarket } from '~/types'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider
  },

  props: {
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
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    },

    gas(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(DEFAULT_GAS_LIMIT)
        .times(DEFAULT_BRIDGE_FEE_PRICE)
        .toBase()
    },

    feePrice(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(
          new BigNumberInWei(DEFAULT_BRIDGE_FEE_PRICE).toBase()
        ).toWei(market.quoteToken.decimals)
      )
    },

    bridgeFee(): BigNumberInBase {
      const { feePrice, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(feePrice.times(DEFAULT_GAS_LIMIT)).toBase(
        market.quoteToken.decimals
      )
    },

    balanceToString(): string {
      const { balance } = this

      return balance.toFixed(
        UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_FLOOR
      )
    }
  },

  methods: {
    onBlur() {
      const { market, form } = this

      if (!market) {
        return
      }

      this.form.amount = new BigNumberInBase(form.amount || 0).toFixed(
        UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
      )
    },

    handleWithdrawClick() {
      const { form, market, bridgeFee } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.token
        .withdraw({
          bridgeFee,
          amount: new BigNumberInBase(form.amount),
          token: market.quoteToken
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
