<template>
  <VModal
    :is-open="isModalOpen"
    has-blur-bg
    sm
    is-always-open
    @modal-closed="closeModal"
  >
    <h3 slot="title">
      {{ $t('marketExpired.title') }}
    </h3>

    <div class="relative">
      <div v-if="market" class="flex justify-between mt-4">
        <div class="flex items-center">
          <div v-if="baseTokenLogo" class="w-8 h-8 mr-3">
            <img
              :src="baseTokenLogo"
              :alt="market.baseToken.name"
              class="min-w-full h-auto rounded-full"
            />
          </div>
          <div class="flex flex-col">
            <p
              data-cy="market-card-ticker-text-content"
              class="uppercase tracking-widest text-sm font-bold leading-4"
            >
              {{ market.ticker }}
            </p>
            <span class="text-xs text-gray-500 capitalize">
              {{ market.baseToken.name }}
            </span>
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-100 mt-4">
        {{ $t('marketExpired.expiredNote') }}
      </p>
      <p class="text-sm text-gray-100 mt-2">
        {{ $t('marketExpired.activityPageNote') }}
      </p>

      <div class="mt-6 flex items-center justify-center">
        <VButton md primary class="rounded mr-2" @click.stop="() => {}">
          <nuxt-link
            :to="{ name: 'markets' }"
            class="flex items-center justify-center"
          >
            <span>{{ $t('marketExpired.exploreMarkets') }}</span>
          </nuxt-link>
        </VButton>
        <VButton md primary-outline class="rounded" @click.stop="() => {}">
          <nuxt-link
            :to="{ name: 'activity' }"
            target="_blank"
            class="flex items-center justify-center"
          >
            <span>{{ $t('marketExpired.goToActivity') }}</span>
          </nuxt-link>
        </VButton>
      </div>
    </div>
  </VModal>
</template>

<script lang="ts">
import {
  getTokenLogoWithVendorPathPrefix,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import Vue, { PropType } from 'vue'
import { Modal } from '~/types'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<UiDerivativeMarketWithToken>,
      required: false,
      default: undefined
    }
  },

  computed: {
    isModalOpen(): boolean {
      const { market } = this

      return this.$accessor.modal.modals[Modal.MarketExpired] && !!market
    },

    baseTokenLogo(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (!market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    }
  },

  beforeDestroy() {
    this.$accessor.modal.closeModal(Modal.MarketExpired)
  },

  methods: {
    closeModal() {
      this.$router.push({ name: 'm' })
    }
  }
})
</script>
