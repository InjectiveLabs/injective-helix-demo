<template>
  <v-modal :is-open="isModalOpen" has-blur-bg sm @modal-closed="closeModal">
    <h3 slot="title" class="text-base">
      {{ $t('marketDeprecated.title') }}
    </h3>

    <div class="relative">
      <i18n path="marketDeprecated.description" tag="p" class="text-sm">
        <span slot="ticker" class="font-bold">{{ ticker }}</span>
      </i18n>

      <ul class="list-disc ml-4 mt-3 text-xs">
        <li>{{ $t('marketDeprecated.subDescriptionOne', { ticker }) }}</li>
        <i18n path="marketDeprecated.subDescriptionTwo" tag="li" class="mt-2">
          <span slot="symbol" class="uppercase">{{ symbol }}</span>
          <span slot="network" class="capitalize">{{ network }}</span>
        </i18n>
      </ul>

      <div class="mt-6 flex flex-col gap-4">
        <nuxt-link :to="{ name: 'markets' }" class="">
          <v-button lg primary class="w-full" @click.stop="() => {}">
            <span class="font-semibold">
              {{ $t('marketDeprecated.exploreOtherMarkets') }}
            </span>
          </v-button>
        </nuxt-link>

        <v-button lg outline @click.stop="() => {}">
          <a
            :href="`https://hub.injective.network/bridge/?token=${symbol}`"
            target="_blank"
            class="flex items-center justify-center text-primary-500 hover:text-primary-600"
          >
            <span class="mr-2 font-semibold">
              {{ $t('marketDeprecated.injectiveBridge') }}
            </span>
            <v-icon-external-link class="w-4 h-4" />
          </a>
        </v-button>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import { BridgingNetwork } from '@injectivelabs/ui-common'
import Vue from 'vue'
import { deprecatedMarkets } from '~/app/data/market'
import { Modal } from '~/types'

export default Vue.extend({
  data() {
    const [deprecatedMarket] = deprecatedMarkets

    return {
      market: deprecatedMarket
    }
  },

  computed: {
    ticker(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      return market.ticker
    },

    symbol(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      return market.baseToken.symbol
    },

    network(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      // todo: expand conditions as required
      if (market.slug === 'huahua-usdt') {
        return BridgingNetwork.Chihuahua
      }

      return BridgingNetwork.Injective
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MarketDeprecated]
    }
  },

  beforeDestroy() {
    this.$accessor.modal.closeModal(Modal.MarketDeprecated)
  },

  methods: {
    closeModal() {
      this.$router.push({ name: 'index' })
    }
  }
})
</script>
