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
          :label="$t('connect.derivationPath')"
          :placeholder="$t('connect.selectDerivationPath')"
        >
        </v-select-custom>
      </div>
      <div class="w-full px-4 mb-2 text-left">
        <div v-if="status.isNotLoading()">
          <VButton sm @click.stop.prevent="handleClickOnFetchAddresses">
            <div
              class="-mx-2 mt-2 flex items-center font-semibold text-primary-500 hover:text-primary-400"
            >
              <span class="mr-2">{{
                addresses.length === 0
                  ? $t('connect.getAddresses')
                  : $t('connect.getMoreAddresses')
              }}</span>
              <IconArrow class="transform rotate-180 w-3 h-3" />
            </div>
          </VButton>
        </div>
        <p v-else class="text-gray-400 text-xs my-2">
          {{ $t('connect.getAddressNote') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { LedgerDerivationPathType } from '@injectivelabs/wallet-ts'
import { Wallet } from '@injectivelabs/ts-types'
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
          label: this.$t('connect.ledgerLive'),
          path: LedgerDerivationPathType.LedgerLive
        },
        {
          label: this.$t('connect.ledgerLegacy'),
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
    addresses(): string[] {
      return this.$accessor.wallet.addresses
    },

    wallet(): Wallet {
      const { form } = this

      return form.path === LedgerDerivationPathType.LedgerLive
        ? Wallet.Ledger
        : Wallet.LedgerLegacy
    }
  },

  watch: {
    'form.path'() {
      this.$accessor.wallet.setAddresses([])
    }
  },

  methods: {
    handleClickOnFetchAddresses() {
      this.status.setLoading()

      this.$accessor.wallet
        .getHWAddresses(this.wallet)
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
