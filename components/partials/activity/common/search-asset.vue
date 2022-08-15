<template>
  <TokenSelector
    class="token-selector__token-only min-w-3xs"
    :value="value"
    :options="supportedTokens"
    :placeholder="'Search asset'"
    :balance="balance"
    dense
    show-default-indicator
    @input:token="handleSelect"
  />
</template>

<script lang="ts">
import {
  BankBalanceWithTokenAndBalance,
  BankBalanceWithTokenAndBalanceInBase,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'

import TokenSelector from '@/components/partials/portfolio/bridge/token-selector/select.vue'

export default Vue.extend({
  components: {
    TokenSelector
  },

  props: {
    markets: {
      type: Array as PropType<
        UiDerivativeMarketWithToken[] | UiSpotMarketWithToken[]
      >,
      default: undefined
    },

    value: {
      type: Object as PropType<Token> | undefined,
      default: undefined
    }
  },

  computed: {
    balance(): BigNumberInBase {
      return ZERO_IN_BASE
    },

    supportedTokens(): BankBalanceWithTokenAndBalanceInBase[] {
      if (!this.markets) {
        return this.$store.state.activity.supportedTokens
      }

      const supportedTokens = this.$store.state.activity.supportedTokens
      const markets: Array<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      > = this.markets

      return supportedTokens.filter(
        (token: BankBalanceWithTokenAndBalance) =>
          !!markets.find(
            (market: UiDerivativeMarketWithToken | UiSpotMarketWithToken) =>
              market.baseToken.denom === token.denom ||
              market.quoteToken.denom === token.denom
          )
      )
    }
  },

  methods: {
    handleSelect(token: Token) {
      this.$emit('select', token)
    }
  }
})
</script>
