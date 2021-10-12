<template>
  <v-modal :is-open="isOpen" @modal-closed="onClose">
    <h3 slot="title">
      {{ $t('Connect using Ledger') }}
    </h3>
    <div class="relative mt-6">
      <v-ledger-address-manager />
      <v-ledger-confirm v-if="addresses.length > 0" @connected="onClose" />
      <p class="text-xs text-gray-400 mt-4">
        {{ $t('Connect using Ledger instructions') }}
      </p>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { AccountAddress } from '@injectivelabs/ts-types'
import VLedgerAddressManager from './addresses.vue'
import VLedgerConfirm from './confirm.vue'

export default Vue.extend({
  components: {
    VLedgerAddressManager,
    VLedgerConfirm
  },

  props: {
    isOpen: {
      required: true,
      type: Boolean
    }
  },

  data() {
    return {
      status: new Status(),
      addressStatus: new Status(),

      form: {
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
    isOpen(isOpen) {
      if (isOpen) {
        this.$accessor.wallet.setAddresses([])
        this.$accessor.wallet.connectLedger()
      }
    }
  },

  methods: {
    onClose() {
      if (this.status.isNotLoading()) {
        this.$emit('closed')
      }
    }
  }
})
</script>
