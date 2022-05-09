<template>
  <div class="relative">
    <v-token-selector
      v-bind="$attrs"
      :options="tokens"
      :disabled="false"
      @input:token="handleTokenChange"
      @input:amount="handleAmountChange"
      @input:max="handleMax"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VTokenSelector from '@/components/partials/portfolio/bridge/token-selector/select.vue'

import {
  Token
} from '@injectivelabs/ui-common'

export default Vue.extend({
  components: {
    VTokenSelector
  },

  props: {
    tokens: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    handleTokenChange(token: Token) {
      this.$emit('input:token', token)
    },

    handleAmountChange(amount: string) {
      this.$emit('input:amount', amount)
    },

    handleMax(percent: Number) {
      this.$emit('input:max', percent)
    }
  }
})
</script>
