<template>
  <ValidationObserver v-if="false" v-slot="{}" ref="form" class="mt-6 p-4">
    <div class="px-2 -mb-2">
      <v-ui-text-info :title="$t('home.available_balance')">
        <span v-if="quoteTokenBalanceInWeiToString">{{
          quoteTokenBalanceInWeiToString
        }}</span>
        <span v-else>&mdash;</span>
      </v-ui-text-info>
    </div>
    <!--
    <ValidationProvider
      v-if="quoteTokenWithBalance"
      v-slot="{ errors, valid }"
      name="form.amount"
      :rules="`required|between:0.0001,${quoteTokenBalanceInWeiToString}`"
    >
      <v-input
        v-model="form.amount"
        :errors="status.isLoading() ? [] : errors"
        :valid="valid"
        :max="quoteTokenBalanceInWeiToString"
        :max-selector="hasBalance"
        :placeholder="$t('wallet.amount_to_deposit')"
        class="mt-4"
        type="number"
        step="0.0001"
        min="0"
      >
        <span slot="addon">{{ quoteTokenWithBalance.symbol }}</span>
      </v-input>
      <div class="w-full mx-auto mt-4">
        <v-ui-button
          :status="status"
          full
          :primary="valid"
          :ghost="invalid"
          :disabled="!form.amount || invalid"
          @click.stop="onSubmit"
        >
          {{ $t('wallet.deposit') }}
        </v-ui-button>
      </div>
    </ValidationProvider>
    -->
  </ValidationObserver>
</template>

<script lang="ts">
import Vue from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import { BigNumberInBase, BigNumber, Status } from '@injectivelabs/utils'
import { TokenWithBalance } from '~/types'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider
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
    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    },

    quoteTokenBalanceInWeiToString(): string {
      return '' // TODO
    }
  },

  methods: {
    onSubmit() {
      /*
      if (!this.quoteTokenWithBalance) {
        return
      }

      
      this.status.setLoading()

      FuturesStoreModule.depositToAccount(new BigNumberInBase(this.form.amount))
        .then(() => {
          this.$toast.success(this.$t('wallet.success_deposit'))
          this.form.amount = ''
          this.$form.reset()
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        }) */
    }
  }
})
</script>
