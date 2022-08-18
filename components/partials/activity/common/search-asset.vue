<template>
  <TokenSelector
    class="token-selector__token-only min-w-3xs"
    :value="value"
    :options="supportedTokens"
    :placeholder="$t('trade.market')"
    :balance="balance"
    dense
    show-default-indicator
    @input:token="handleSelect"
  />
</template>

<script lang="ts">
import {
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
    supportedTokens(): BankBalanceWithTokenAndBalanceInBase[] {
      const markets: Array<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      > = this.markets

      // TODO: In TokenSelector V2 refactor this to also accept array of tokens.
      const tokens = markets.reduce((list, market) => {
        const baseToken = {
          balance: '',
          denom: market.baseToken.denom,
          token: market.baseToken
        } as BankBalanceWithTokenAndBalanceInBase

        const quoteToken = {
          balance: '',
          denom: market.quoteToken.denom,
          token: market.quoteToken
        } as BankBalanceWithTokenAndBalanceInBase

        return [...list, baseToken, quoteToken]
      }, [] as BankBalanceWithTokenAndBalanceInBase[])

      const uniqueTokens = [
        ...new Map(tokens.map((token) => [token.denom, token])).values()
      ]

      return uniqueTokens
    },

    balance(): BigNumberInBase {
      return ZERO_IN_BASE
    }
  },

  methods: {
    handleSelect(token: Token) {
      this.$emit('select', token)
    }
  }
})
</script>
