<template>
  <div class="mt-4 border-b border-gray-600">
    <div class="flex flex-wrap -mx-4">
      <div class="w-full px-4">
        <v-select-custom
          v-model="form.path"
          :options="
            derivationPaths.map((a) => ({
              code: a.path,
              label: a.label
            }))
          "
          :label="$t('Derivation Path')"
          :placeholder="$t('Select Derivation Path')"
        >
        </v-select-custom>
      </div>
      <div class="w-full px-4 mb-2 text-left">
        <div v-if="status.isNotLoading()">
          <v-button sm @click.stop.prevent="handleClickOnFetchAddresses">
            <div
              class="-mx-2 mt-2 flex items-center font-semibold text-primary-500 hover:text-primary-400"
            >
              <span class="mr-2">{{
                addresses.length === 0
                  ? $t('Get addresses')
                  : $t('Get more addresses')
              }}</span>
              <v-icon-arrow class="transform rotate-180 w-3 h-3"></v-icon-arrow>
            </div>
          </v-button>
        </div>
        <p v-else class="text-gray-400 text-xs my-2">
          {{ $t('We are getting your addresses, please wait ...') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { AccountAddress } from '@injectivelabs/ts-types'
import { LedgerDerivationPathType } from '@injectivelabs/web3-strategy'
import VSelectCustom from '~/components/inputs/select-custom.vue'

export default Vue.extend({
  components: {
    VSelectCustom
  },

  data() {
    return {
      status: new Status(),
      derivationPaths: [
        {
          label: this.$t('Ledger Live'),
          path: LedgerDerivationPathType.LedgerLive
        } /*
        {
          label: this.$t('Ledger Legacy'),
          path: LedgerDerivationPathType.LedgerMew
        } */
      ],

      form: {
        path: LedgerDerivationPathType.LedgerLive,
        address: ''
      }
    }
  },

  computed: {
    addresses(): AccountAddress[] {
      return this.$accessor.wallet.addresses
    }
  },

  watch: {
    'form.path'(newValue: LedgerDerivationPathType) {
      this.$accessor.wallet.connectLedger({
        baseDerivationPath: newValue
      })
    }
  },

  methods: {
    handleClickOnFetchAddresses() {
      this.status.setLoading()

      this.$accessor.wallet
        .getAddresses()
        .then((addresses: string[]) => {
          this.$accessor.wallet.setAddresses([...addresses, ...this.addresses])
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
