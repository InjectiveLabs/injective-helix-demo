<template>
  <VModal :is-open="isOpen" md @modal-closed="onClose">
    <h3 slot="title">
      {{ $t('connect.connectUsingTrezor') }}
    </h3>
    <div class="relative mt-6">
      <TrezorAddressManager />
      <TrezorConfirm v-if="addresses.length > 0" @connected="onClose" />
      <p class="text-xs text-gray-400 mt-4">
        {{ $t('connect.connectUsingTrezorNote') }}
      </p>
    </div>
  </VModal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import TrezorAddressManager from './addresses.vue'
import TrezorConfirm from './confirm.vue'

export default Vue.extend({
  components: {
    TrezorAddressManager,
    TrezorConfirm
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
    addresses(): string[] {
      return this.$accessor.wallet.addresses
    }
  },

  watch: {
    isOpen(isOpen) {
      if (isOpen) {
        this.$accessor.wallet.setAddresses([])
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
