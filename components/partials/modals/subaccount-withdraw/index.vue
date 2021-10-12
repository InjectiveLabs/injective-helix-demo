<template>
  <v-modal :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('Withdraw from Subaccount') }}
    </h3>

    <div v-if="market" class="relative">
      <div class="flex flex-wrap">
        <div v-if="!baseBalance.isNaN()" class="w-full mb-2 lg:w-1/2 px-4">
          <v-subaccount-balance
            :balance="baseBalance"
            :token="market.baseToken"
          />
        </div>
        <div
          v-if="quoteBalance"
          class="px-4"
          :class="{
            'w-full': baseBalance.isNaN(),
            'w-full lg:w-1/2 lg:border-l': !baseBalance.isNaN()
          }"
        >
          <v-subaccount-balance
            :balance="quoteBalance"
            :token="market.quoteToken"
          />
        </div>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import VSubaccountBalance from './subaccount-balance.vue'
import {
  UiSpotMarket,
  Modal,
  UiDerivativeMarket,
  MarketType,
  UiSubaccount
} from '~/types'
import { ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VSubaccountBalance
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    spotMarket(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    derivativeMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    market(): UiSpotMarket | UiDerivativeMarket | undefined {
      const { spotMarket, derivativeMarket } = this

      return this.$route.name === 'spot-spot' ? spotMarket : derivativeMarket
    },

    baseBalance(): BigNumberInBase {
      const { subaccount, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (market.type === MarketType.Derivative) {
        return new BigNumberInBase('')
      }

      if (!subaccount) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.baseToken.denom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        market.baseToken.decimals
      )
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
      return this.$accessor.modal.modals[Modal.SubaccountWithdraw]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.SubaccountWithdraw)
    }
  }
})
</script>
