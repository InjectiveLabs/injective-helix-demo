<template>
  <TokenSelector
    v-bind="$attrs"
    :disabled="isIbcTransfer"
    @input:token="handleTokenChange"
    @input:amount="handleAmountChange"
    @input:max="handleMax"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import TokenSelector from './select.vue'
import { TransferSide, TransferDirection } from '~/types'

export default Vue.extend({
  components: {
    TokenSelector
  },

  props: {
    origin: {
      type: String as PropType<
        BridgingNetwork | TransferSide | TransferDirection
      >,
      required: true
    },

    destination: {
      type: String as PropType<
        BridgingNetwork | TransferSide | TransferDirection
      >,
      required: true
    },

    isIbcTransfer: {
      type: Boolean,
      required: true
    }
  },

  methods: {
    handleAmountChange(value: string) {
      this.$emit('input:amount', value)
    },

    handleTokenChange(value: Token) {
      this.$emit('input:token', value)
    },

    handleMax(value: string) {
      this.$emit('input:max', value)
    }
  }
})
</script>
