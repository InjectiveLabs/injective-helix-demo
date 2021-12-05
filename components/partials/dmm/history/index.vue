<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('dmm.history.title') }}
    </h3>
    <div class="relative" :class="{ 'mt-8': status.isLoading() }">
      <HOCLoading :status="status">
        <v-card class="mt-6">
          <div class="p-2">
            <div v-if="isUserWalletConnected">
              <p class="text-gray-500 uppercase text-xs">
                {{ $t('dmm.history.address') }}
              </p>
              <h3
                class="text-gray-200 text-base sm:text-lg md:text-2xl mt-3 break-all"
              >
                {{ injectiveAddress }}
              </h3>

              <VHistoryTable class="mt-6" />
            </div>
            <div v-else class="px-6 py-12 text-center">
              <p>{{ $t('dmm.history.connectMsg') }}</p>
              <v-button
                lg
                primary
                class="mt-4"
                @click.stop="handleClickOnConnect"
              >
                {{ $t('connect') }}
              </v-button>
            </div>
          </div>
        </v-card>
      </HOCLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VHistoryTable from './history-table.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import { UiDmmMarketMaker } from '~/types'

export default Vue.extend({
  components: {
    HOCLoading,
    VHistoryTable
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    marketMakers(): UiDmmMarketMaker[] {
      return this.$accessor.dmm.marketMakers
    },

    dmmName(): string | undefined {
      const { marketMakers, injectiveAddress } = this

      const dmm = marketMakers.find(
        ({ address }) => address === injectiveAddress
      )

      return dmm ? dmm.name : undefined
    }
  },

  mounted() {
    this.$root.$on('wallet-connected', this.fetchEpochSummary)
    if (this.isUserWalletConnected) {
      this.fetchEpochSummary()
    } else {
      this.status.setIdle()
    }
  },

  beforeDestroy() {
    this.$root.$off('wallet-connected', this.fetchEpochSummary)
  },

  methods: {
    handleClickOnConnect() {
      this.$root.$emit('wallet-clicked')
    },

    fetchEpochSummary() {
      const { injectiveAddress, dmmName } = this

      this.status.setLoading()

      this.$accessor.dmm
        .fetchDMMRecords({
          dmmName,
          accountAddress: injectiveAddress
        })
        .then(() => {})
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
