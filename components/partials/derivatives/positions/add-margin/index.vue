<template>
  <modal :is-open="isModalOpen" @closed="closeModal">
    <div v-if="market" class="w-full md:w-3xl flex flex-col shadow">
      <div class="my-6 flex flex-wrap">
        <div class="w-full mb-6 px-4">
          <h3 class="text-center text-2xl uppercase">
            {{ $t('add_margin_to_position_title') }}
          </h3>
          <p class="text-sm text-center opacity-90 mt-4">
            {{ $t('add_margin_to_position_note') }}
          </p>
        </div>
        <div class="w-full px-4">
          <v-form :balance="quoteTokenBalance"></v-form>
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Form from './form.vue'
import ModalElement from '~/components/elements/modal.vue'
import { UiDerivativeMarket, UiPosition, UiSubaccount } from '~/types'
import { ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    modal: ModalElement,
    'v-form': Form
  },

  data() {
    return {
      position: null as null | UiPosition
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    quoteTokenBalance(): BigNumberInBase {
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
