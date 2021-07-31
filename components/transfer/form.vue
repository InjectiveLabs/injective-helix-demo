<template>
  <div class="p-4">
    <div class="px-2">
      <v-select-custom
        v-model="form.denom"
        :options="
          balances.map((a) => ({
            code: a.denom,
            label: a.token.symbol
          }))
        "
        :label="$t('asset')"
        :placeholder="$t('select_asset')"
        class="mb-8"
      >
      </v-select-custom>

      <template v-if="form.denom && balanceToString">
        <v-ui-text-info :title="$t('available_balance')">
          <span v-if="balanceToString">{{ balanceToString }}</span>
          <span v-else class="text-gray-400 font-normal text-xs">&mdash;</span>
        </v-ui-text-info>

        <ValidationObserver v-slot="{ invalid }" ref="form">
          <div class="mb-4">
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
                  balance ? balance.token.symbol : ''
                }}</span>
              </v-input>
            </ValidationProvider>
          </div>
          <div>
            <ValidationProvider
              v-slot="{ errors, valid }"
              name="form.destination"
              :rules="`required|injaddress`"
            >
              <v-input
                v-model="form.destination"
                :errors="status.isLoading() ? [] : errors"
                :valid="valid"
                :placeholder="$t('destination')"
              >
              </v-input>
            </ValidationProvider>
          </div>
          <div class="w-full mx-auto mt-4">
            <v-ui-button
              :status="status"
              full
              :primary="!invalid"
              :ghost="invalid"
              :disabled="!form.amount || !form.destination || invalid"
              @click.stop="handleTransferClick"
            >
              {{ $t('transfer') }}
            </v-ui-button>
          </div>
        </ValidationObserver>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import { BankBalanceWithTokenMetaData } from '~/types'
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '~/app/utils/constants'
import VSelectCustom from '~/components/inputs/select-custom.vue'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider,
    VSelectCustom
  },

  props: {
    balances: {
      required: true,
      type: Array as PropType<BankBalanceWithTokenMetaData[]>
    }
  },

  data() {
    return {
      status: new Status(),

      form: {
        amount: '',
        denom: 'inj',
        destination: ''
      }
    }
  },

  computed: {
    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    },

    balance(): BankBalanceWithTokenMetaData | undefined {
      const { balances, form } = this

      return balances.find((balance) => balance.denom === form.denom)
    },

    balanceToString(): string {
      const { balance } = this

      if (!balance) {
        return ''
      }

      return new BigNumberInWei(balance.balance)
        .toBase(balance.token.decimals)
        .toFixed(
          UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
          BigNumberInBase.ROUND_FLOOR
        )
    }
  },

  methods: {
    onBlur() {
      const { form } = this

      this.form.amount = new BigNumberInBase(form.amount || 0).toFixed(
        UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
      )
    },

    handleTransferClick() {
      const { form, balance } = this

      if (!balance) {
        return
      }

      this.status.setLoading()

      this.$accessor.bank
        .transfer({
          token: balance.token,
          denom: form.denom,
          destination: form.destination,
          amount: new BigNumberInBase(form.amount)
        })
        .then(() => {
          this.$toast.success(this.$t('success_transfer_assets'))
          this.form.amount = ''
          this.form.destination = ''

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
