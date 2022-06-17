<template>
  <div class="relative rounded-lg" :class="{ 'opacity-50': disabled }">
    <Select
      v-bind="$attrs"
      :options="tokens"
      :disabled="disabled"
      :balance="balance"
      show-balance
      dense
      small
      @input:token="handleTokenChange"
      @input:amount="handleAmountChange"
      @input:max="handleMax"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase } from '@injectivelabs/utils'
import Select from '@/components/partials/portfolio/bridge/token-selector/select.vue'

export default Vue.extend({
  components: {
    Select
  },

  props: {
    balance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    tokens: {
      type: Array,
      default: () => []
    },

    disabled: {
      type: Boolean,
      default: false
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
