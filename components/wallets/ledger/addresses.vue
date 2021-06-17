<template>
  <div class="mt-4 px-4 border-b">
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
          :label="$t('derivation_path')"
          :placeholder="$t('select_derivation_path')"
          class="mt-2"
        >
        </v-select-custom>
      </div>
      <div class="w-full px-4 mb-2">
        <div v-if="status.isNotLoading()" class="-mx-4">
          <v-ui-button
            sm
            text
            class="text-primary-500"
            @click="onFetchAddresses"
          >
            {{
              addresses.length === 0
                ? $t('get_addresses')
                : $t('get_more_addresses')
            }}
          </v-ui-button>
        </div>
        <p v-else class="text-gray-300 text-2xs my-2">
          {{ $t('please_wait_addresses') }}
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
          label: this.$t('ledger_live'),
          path: LedgerDerivationPathType.LedgerLive
        },
        {
          label: this.$t('ledger_legacy'),
          path: LedgerDerivationPathType.LedgerMew
        }
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
    onFetchAddresses() {
      this.status.setLoading()

      this.$accessor.wallet
        .getAddresses()
        .then((addresses: string[]) => {
          this.$accessor.wallet.setAddresses([...addresses, ...this.addresses])
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
