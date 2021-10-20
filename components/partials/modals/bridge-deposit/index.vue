<template>
  <v-modal :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('Deposit to Injective Chain') }}
    </h3>

    <div class="relative">
      <HOCLoading :status="status">
        <div class="flex flex-wrap">
          <div
            v-if="
              baseTokenWithBalance && market && market.type === MarketType.Spot
            "
            class="w-full mb-2 lg:w-1/2 px-4"
          >
            <v-token :token="baseTokenWithBalance" />
          </div>
          <div
            v-if="quoteTokenWithBalance"
            class="px-4"
            :class="{
              'w-full': market && market.type === MarketType.Derivative,
              'w-full lg:w-1/2 lg:border-l':
                market && market.type === MarketType.Spot
            }"
          >
            <v-token :token="quoteTokenWithBalance" />
          </div>
        </div>
      </HOCLoading>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VToken from './token.vue'
import {
  UiSpotMarket,
  Modal,
  TokenWithBalance,
  UiDerivativeMarket,
  MarketType
} from '~/types'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    VToken
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      MarketType
    }
  },

  computed: {
    spotMarket(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    derivativeMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    market(): UiSpotMarket | UiDerivativeMarket | undefined {
      const { spotMarket, derivativeMarket } = this

      return this.$route.name === 'spot-spot' ? spotMarket : derivativeMarket
    },

    baseTokenWithBalance(): TokenWithBalance | undefined {
      return this.$accessor.token.baseTokenWithBalance
    },

    quoteTokenWithBalance(): TokenWithBalance | undefined {
      return this.$accessor.token.quoteTokenWithBalance
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.BridgeDeposit]
    }
  },

  mounted() {
    this.getTokenBalanceAndAllowance()
  },

  methods: {
    getTokenBalanceAndAllowance() {
      this.$accessor.token
        .getTokenBalanceAndAllowance()
        .then(() => {
          //
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    closeModal() {
      this.$accessor.modal.closeModal(Modal.BridgeDeposit)
    }
  }
})
</script>
