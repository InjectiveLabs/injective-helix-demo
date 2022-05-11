<template>
  <v-modal :is-open="isModalOpen" has-blur-bg sm @modal-closed="closeModal">
    <h3 slot="title" class="text-base">
      {{ $t('marketUnTradable.title') }}
    </h3>

    <div class="relative">
      <i18n path="marketUnTradable.description" tag="p" class="text-sm">
        <span slot="ticker" class="font-bold">{{ ticker }}</span>
      </i18n>

      <ul class="list-disc ml-4 mt-3 text-xs">
        <li>{{ $t('marketUnTradable.subDescriptionOne', { ticker }) }}</li>
        <i18n path="marketUnTradable.subDescriptionTwo" tag="p" class="mt-2">
          <span slot="symbol" class="uppercase">{{ symbol }}</span>
          <span slot="network" class="capitalize">{{ network }}</span>
        </i18n>
      </ul>

      <div class="mt-6 flex flex-col gap-4">
        <nuxt-link :to="{ name: 'markets' }" class="">
          <v-button lg primary class="w-full" @click.stop="() => {}">
            <span class="font-semibold">
              {{ $t('marketUnTradable.exploreOtherMarkets') }}
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
              {{ $t('marketUnTradable.injectiveBridge') }}
            </span>
            <v-icon-external-link class="w-4 h-4" />
          </a>
        </v-button>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import {
  UiSpotMarketWithToken,
  BridgingNetwork
} from '@injectivelabs/ui-common'
import Vue, { PropType } from 'vue'
import { Modal } from '~/types'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<UiSpotMarketWithToken>,
      required: true
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
      return this.$accessor.modal.modals[Modal.MarketUnTradable]
    }
  },

  beforeDestroy() {
    this.$accessor.modal.closeModal(Modal.MarketUnTradable)
  },

  methods: {
    closeModal() {
      this.$router.push({ name: 'markets' })
    }
  }
})
</script>
