<template>
  <v-modal :is-open="isModalOpen" sm @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('trade.add_margin_to_position_title') }}
    </h3>

    <div v-if="market && quoteBalance" class="relative">
      <div class="flex flex-wrap">
        <div class="px-4 w-full">
          <v-form
            :balance="quoteBalance"
            :market="market"
            @close-modal="closeModal"
          />
        </div>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiPosition,
  UiSubaccount,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import Form from './form.vue'

export default Vue.extend({
  components: {
    'v-form': Form
  },

  data() {
    return {
      position: null as null | UiPosition
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    market(): UiDerivativeMarketWithToken | undefined {
      const { markets, position } = this

      if (!position) {
        return undefined
      }

      return markets.find((market) => market.marketId === position.marketId)
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    quoteBalance(): BigNumberInBase {
      const { subaccount, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!subaccount) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.quoteToken.denom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        market.quoteToken.decimals
      )
    },

    isModalOpen(): boolean {
      const { position } = this

      return !!position
    }
  },

  mounted() {
    this.$root.$on('add-margin-to-position', this.onAddMarginToPosition)
  },

  methods: {
    onAddMarginToPosition(position: UiPosition) {
      this.position = position
    },

    closeModal() {
      this.position = null
    }
  }
})
</script>
