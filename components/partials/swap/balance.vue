<template>
  <div class="font-mono text-xs">
    <span class="text-gray-500">
      {{ $t('trade.balance', { balance: formattedBalance }) }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    balance: {
      required: false,
      default: undefined,
      type: Object as PropType<BigNumberInBase>
    },

    decimalPlaces: {
      type: Number,
      required: true
    }
  },

  computed: {
    formattedBalance(): string {
      const { balance, decimalPlaces } = this

      return balance.toFormat(decimalPlaces, BigNumberInBase.ROUND_DOWN)
    }
  }
})
</script>
