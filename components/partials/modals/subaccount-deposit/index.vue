<template>
  <v-modal :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('Deposit to Subaccount') }}
    </h3>

    <div v-if="market" class="relative">
      <div class="flex flex-wrap">
        <div v-if="!baseBalance.isNaN()" class="w-full mb-2 lg:w-1/2 px-4">
          <v-bank-balance :balance="baseBalance" :token="market.baseToken" />
        </div>
        <div
          v-if="quoteBalance"
          class="px-4"
          :class="{
            'w-full': baseBalance.isNaN(),
            'w-full lg:w-1/2 lg:border-l': !baseBalance.isNaN()
          }"
        >
          <v-bank-balance :balance="quoteBalance" :token="market.quoteToken" />
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
import VBankBalance from './bank-balance.vue'
import {
  UiSpotMarket,
  Modal,
  UiDerivativeMarket,
  BankBalances,
  MarketType
} from '~/types'
import { ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VBankBalance
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

    balances(): BankBalances {
      return this.$accessor.bank.balances
    },

    market(): UiSpotMarket | UiDerivativeMarket | undefined {
      const { spotMarket, derivativeMarket } = this

      return this.$route.name === 'spot-spot' ? spotMarket : derivativeMarket
    },

    baseBalance(): BigNumberInBase {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (market.type === MarketType.Derivative) {
        return new BigNumberInBase('')
      }

      if (!balances[(market as UiSpotMarket).baseDenom]) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(
        balances[(market as UiSpotMarket).baseDenom] || 0
      ).toBase(market.baseToken.decimals)
    },

    quoteBalance(): BigNumberInBase {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!balances[market.quoteDenom]) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balances[market.quoteDenom] || 0).toBase(
        market.quoteToken.decimals
      )
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.SubaccountDeposit]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.SubaccountDeposit)
    }
  }
})
</script>
