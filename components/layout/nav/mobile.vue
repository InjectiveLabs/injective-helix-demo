<template>
  <div class="block lg:hidden">
    <Accordion :is-open="tradeMenuOpen" sm @togglePanel="handleToggleTradeMenu">
      <div slot="title" class="text-sm font-semibold">
        {{ $t('navigation.trade') }}
      </div>

      <template slot="content">
        <NavItem :to="defaultSpotMarketRoute">
          <span class="font-normal tracking-wide">{{
            $t('navigation.spot')
          }}</span>
        </NavItem>

        <NavItem :to="defaultPerpetualMarketRoute">
          <span class="font-normal tracking-wide">{{
            $t('navigation.perpetual')
          }}</span>
        </NavItem>

        <NavItem
          :to="{
            name: 'convert-convert',
            query: { from: 'usdt', to: 'inj' }
          }"
        >
          <span class="font-normal tracking-wide">{{
            $t('navigation.convert')
          }}</span>
        </NavItem>
      </template>
    </Accordion>

    <Accordion
      :is-open="rewardsMenuOpen"
      sm
      @togglePanel="handleToggleRewardsMenu"
    >
      <div slot="title" class="text-sm font-semibold">
        {{ $t('navigation.rewards') }}
      </div>

      <div slot="content">
        <NavItem :to="{ name: 'trade-and-earn' }">
          <span class="font-normal tracking-wide">
            {{ $t('navigation.tradeAndEarn') }}
          </span>
        </NavItem>

        <a
          class="text-gray-200 hover:bg-gray-800 hover:text-white text-sm font-semibold rounded-lg cursor-pointer mx-px h-10 flex items-center px-6 py-2"
          href="https://dmm.injective.network"
          target="_blank"
        >
          <span class="font-normal tracking-wide">
            {{ $t('navigation.dmmProgram') }}
          </span>
        </a>

        <a
          class="text-gray-200 hover:bg-gray-800 hover:text-white text-sm font-semibold rounded-lg cursor-pointer mx-px h-10 flex items-center px-6 py-2"
          href="https://affiliate.helixapp.com"
          target="_blank"
        >
          <span class="font-normal tracking-wide">
            {{ $t('navigation.affiliateProgram') }}
          </span>
        </a>
      </div>
    </Accordion>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import NavItem from './item.vue'
import Accordion from '~/components/elements/accordion.vue'
import { DefaultMarket, MarketRouteWithoutMarketId } from '~/types'
import {
  getDefaultPerpetualMarketRoute,
  getDefaultSpotMarketRoute
} from '~/app/utils/market'

export default Vue.extend({
  components: {
    NavItem,
    Accordion
  },

  data() {
    return {
      DefaultMarket,
      tradeMenuOpen: false,
      rewardsMenuOpen: false
    }
  },

  methods: {
    handleToggleTradeMenu() {
      this.tradeMenuOpen = !this.tradeMenuOpen
    },

    handleToggleRewardsMenu() {
      this.rewardsMenuOpen = !this.rewardsMenuOpen
    },

    defaultPerpetualMarketRoute(): MarketRouteWithoutMarketId {
      return getDefaultPerpetualMarketRoute()
    },

    defaultSpotMarketRoute(): MarketRouteWithoutMarketId {
      return getDefaultSpotMarketRoute()
    }
  }
})
</script>
