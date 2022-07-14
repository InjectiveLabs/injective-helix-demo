<template>
  <div class="mt-2 text-right">
    <div class="text-primary-400 tracking-1 text-sm">
      {{ $t('bridge.available') }}
      <span data-cy="transfer-modal-available-text-content">{{
        balanceToString
      }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { BIG_NUMBER_ROUND_DOWN_MODE } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {},

  props: {
    balance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    token: {
      type: Object as PropType<Token>,
      default: undefined
    }
  },

  computed: {
    balanceToString(): string {
      const { balance, token } = this

      const symbol = token ? token.symbol : ''

      return `${balance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BIG_NUMBER_ROUND_DOWN_MODE
      )} ${symbol}`
    }
  },

  methods: {
    handleRefresh() {
      this.$emit('balance:refresh')
    }
  }
})
</script>
